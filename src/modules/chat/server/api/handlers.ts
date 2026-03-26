import { env } from "cloudflare:workers";
import { jsonError, textError } from "@/lib/http/error-responses";
import {
	buildUntrustedRequestResponse,
	hasTrustedPostRequestProvenance,
} from "@/lib/security/request-provenance";
import { getCloudflareRequestMetadata } from "@/services/cloudflare";
import { auth } from "@/services/auth";
import { ChatRequestError } from "../../errors/chat-request-error";
import { loadLatestChat } from "../../logic/load-conversation";
import { reportChatRouteError } from "./error-reporting";
import { logChatApiEvent } from "./logging";
import {
	mapChatRequestErrorToResponse,
	validateChatPostRequest,
} from "./request-guards";
import { createChatResponse } from "../logic/create-chat-response";
import {
	buildUserChatQuotaExceededResponse,
	enforceUserChatQuota,
	UserChatQuotaExceededError,
} from "../quota/user-chat-quota";

const CHAT_BUSY_MESSAGE =
	"Ore AI is a little busy right now. Please try again in a moment.";

export async function handleGetChat(request: Request) {
	const userId = await getSessionUserId(request.headers);
	return Response.json(await loadLatestChat(userId));
}

export async function handlePostChat(request: Request) {
	const startedAt = Date.now();
	const requestId = crypto.randomUUID();
	const cloudflare = getCloudflareRequestMetadata(request);
	let status = 500;
	let userId: string | null = null;

	try {
		if (!hasTrustedPostRequestProvenance(request)) {
			status = 403;
			return buildUntrustedRequestResponse();
		}

		userId = await getSessionUserId(request.headers);
		if (!userId) {
			status = 401;
			return textError(401, "Session access required.");
		}

		const chatRequest = await validateChatPostRequest(request);
		await enforceUserChatQuota(env.CHAT_USER_QUOTA, userId);
		const response = await createChatResponse({
			request,
			requestId,
			userId,
			...chatRequest,
		});
		status = response.status;
		return response;
	} catch (error) {
		const failure = handleChatHandlerError({ error, request, requestId });
		status = failure.status;
		return failure.response;
	} finally {
		logChatApiEvent({
			requestId,
			route: "/api/chat",
			status,
			durationMs: Date.now() - startedAt,
			userId,
			chatId: null,
			rateLimited: status === 429,
			cfRay: cloudflare.cfRay,
			cfColo: cloudflare.cfColo,
			cfCountry: cloudflare.cfCountry,
		});
	}
}

async function getSessionUserId(headers: Headers) {
	const session = await auth.api.getSession({ headers });
	return typeof session?.user?.id === "string" ? session.user.id : null;
}

function handleChatHandlerError({
	error,
	request,
	requestId,
}: {
	error: unknown;
	request: Request;
	requestId: string;
}) {
	if (error instanceof ChatRequestError) {
		return {
			status: error.status,
			response: mapChatRequestErrorToResponse(error),
		};
	}

	if (error instanceof UserChatQuotaExceededError) {
		return {
			status: error.status,
			response: buildUserChatQuotaExceededResponse(),
		};
	}

	if (isRateLimitError(error)) {
		return {
			status: 429,
			response: jsonError(429, CHAT_BUSY_MESSAGE),
		};
	}

	reportChatRouteError({
		request,
		requestId,
		route: "/api/chat",
		stage: "handler",
		error,
	});

	return {
		status: 500,
		response: jsonError(500, "Internal server error"),
	};
}

function isRateLimitError(error: unknown) {
	if (typeof error === "object" && error !== null && "status" in error) {
		return error.status === 429;
	}

	return error instanceof Error && /429|rate limit/i.test(error.message);
}
