import { env } from "cloudflare:workers";
import {
	buildUntrustedRequestResponse,
	hasTrustedPostRequestProvenance,
} from "@/lib/security/request-provenance";
import { getCloudflareRequestMetadata } from "@/services/cloudflare";
import { auth } from "@/services/auth";
import { ChatRequestError } from "../../errors/chat-request-error";
import { CHAT_CONTEXT_MAX_BYTES } from "../../constants";
import { selectMessagesByTurnSize } from "../../logic/context-window";
import {
	loadLatestSessionChat,
	loadSessionChat,
} from "../../logic/load-conversation";
import {
	SessionSaveConflictError,
	saveSessionChat,
} from "../../logic/save-conversation";
import { streamAssistantReply } from "../stream/assistant-stream";
import type { SessionMessage } from "../../types";
import { reportChatRouteError } from "./error-reporting";
import { jsonError } from "./http";
import { logChatApiEvent } from "./logging";
import {
	mapChatRequestErrorToResponse,
	validateChatPostRequest,
} from "./request-guards";
import { resolveChatRuntimeConfig } from "../config/runtime-config";

export async function handleGetChat(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });
	const userId = typeof session?.user?.id === "string" ? session.user.id : null;
	return Response.json(await loadLatestSessionChat(userId));
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

		const session = await auth.api.getSession({ headers: request.headers });
		userId = typeof session?.user?.id === "string" ? session.user.id : null;
		if (!userId) {
			status = 401;
			return jsonError(401, "Session access required.");
		}
		const activeUserId = userId;

		const { sessionId, message } = await validateChatPostRequest(request);
		const storedSession = await loadSessionChat(activeUserId, sessionId);
		const messages = selectMessagesByTurnSize({
			messages: [...(storedSession?.messages ?? []), message],
			maxBytes: CHAT_CONTEXT_MAX_BYTES,
		});
		const runtimeConfig = await resolveChatRuntimeConfig(env);
		const googleApiKey = env.GOOGLE_GENERATIVE_AI_API_KEY.trim();
		if (!googleApiKey) {
			throw new Error(
				"Missing GOOGLE_GENERATIVE_AI_API_KEY for chat model provider.",
			);
		}
		const mcpInternalSecret = env.MCP_INTERNAL_SHARED_SECRET?.trim();
		if (!mcpInternalSecret) {
			throw new Error("Missing MCP_INTERNAL_SHARED_SECRET for MCP binding.");
		}

		const response = await streamAssistantReply({
			requestId,
			agentOptions: { googleApiKey },
			messages,
			actorId: activeUserId,
			mcpServiceBinding: env.ORE_AI_MCP,
			mcpInternalSecret,
			mcpServerUrl: runtimeConfig.mcpServerUrl,
			agentSystemPrompt: runtimeConfig.agentSystemPrompt,
			onFinishMessages: async (completedMessages: SessionMessage[]) => {
				try {
					await saveSessionChat({
						userId: activeUserId,
						sessionId,
						messages: completedMessages,
					});
				} catch (error) {
					reportChatRouteError({
						request,
						requestId,
						route: "/api/chat",
						stage:
							error instanceof SessionSaveConflictError
								? "persist_conflict"
								: "persist",
						error,
						userId: activeUserId,
						chatId: sessionId,
					});

					if (error instanceof SessionSaveConflictError) {
						return;
					}
				}
			},
		});
		status = response.status;
		return response;
	} catch (error) {
		if (error instanceof ChatRequestError) {
			status = error.status;
			return mapChatRequestErrorToResponse(error);
		}

		if (
			typeof error === "object" &&
			error !== null &&
			"status" in error &&
			error.status === 429
		) {
			status = 429;
			return jsonError(
				429,
				"Ore AI is a little busy right now. Please try again in a moment.",
			);
		}

		if (error instanceof Error && /429|rate limit/i.test(error.message)) {
			status = 429;
			return jsonError(
				429,
				"Ore AI is a little busy right now. Please try again in a moment.",
			);
		}

		reportChatRouteError({
			request,
			requestId,
			route: "/api/chat",
			stage: "handler",
			error,
		});
		status = 500;
		return jsonError(500, "Internal server error");
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
