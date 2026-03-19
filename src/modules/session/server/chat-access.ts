import { applyAnonymousRateLimit } from "@/lib/security/rate-limit";
import { tryCatch } from "@/lib/try-catch";
import { isRecord } from "@/lib/type-guards";
import { auth } from "@/services/auth";
import { verifyTurnstileToken } from "@/services/cloudflare";
import type { RateLimiterNamespace } from "@/services/cloudflare/rate-limiter";
import {
	buildUntrustedRequestResponse,
	hasTrustedPostRequestProvenance,
} from "@/lib/security/request-provenance";
import { SESSION_ACCESS_TURNSTILE_ACTION } from "../constants";
import {
	createSessionAccessCookie,
	getSessionAccessBindingId,
	hasValidSessionAccessCookie,
} from "./session-access-cookie";

type ChatAccessEnv = {
	SESSION_ACCESS_SECRET?: string;
	TURNSTILE_SECRET_KEY?: string;
	RATE_LIMITER?: RateLimiterNamespace;
};

type BlockedChatSessionAccess = {
	ok: false;
	response: Response;
};

type AllowedChatSessionAccess = {
	ok: true;
	sessionBindingId: string;
	responseHeaders: Headers | null;
};

export type ChatSessionAccessResult =
	| BlockedChatSessionAccess
	| AllowedChatSessionAccess;

function jsonError(status: number, error: string): Response {
	return Response.json({ error }, { status });
}

async function readTurnstileToken(request: Request): Promise<string | null> {
	const rawBody = await request.text();
	const payload = tryCatch(JSON.parse)(rawBody);
	if (payload.error || !isRecord(payload.data)) {
		return null;
	}

	const token = payload.data.turnstileToken;
	return typeof token === "string" && token.trim().length > 0 ? token : null;
}

async function resolveAnonymousSessionHeaders(
	request: Request,
): Promise<Headers> {
	const headers = new Headers();
	const session = await auth.api.getSession({
		headers: request.headers,
	});
	if (session) {
		return headers;
	}

	const signInAnonymous = (
		auth.api as typeof auth.api & {
			signInAnonymous: (input: {
				headers: Headers;
				returnHeaders: true;
			}) => Promise<{ headers: Headers }>;
		}
	).signInAnonymous;
	const anonymousSession = await signInAnonymous({
		headers: request.headers,
		returnHeaders: true,
	});
	const authSetCookie = anonymousSession.headers.get("set-cookie");
	if (authSetCookie) {
		headers.append("set-cookie", authSetCookie);
	}
	return headers;
}

export async function resolveChatSessionAccess(input: {
	request: Request;
	env: ChatAccessEnv;
}): Promise<ChatSessionAccessResult> {
	if (!hasTrustedPostRequestProvenance(input.request)) {
		return {
			ok: false,
			response: buildUntrustedRequestResponse(),
		};
	}

	const sessionSecret = input.env.SESSION_ACCESS_SECRET?.trim();
	if (!sessionSecret) {
		return {
			ok: false,
			response: jsonError(503, "Session verification is unavailable."),
		};
	}

	const existingSessionBindingId = await getSessionAccessBindingId({
		request: input.request,
		secret: sessionSecret,
	});
	const hasSessionAccess = await hasValidSessionAccessCookie({
		request: input.request,
		secret: sessionSecret,
	});

	if (hasSessionAccess && existingSessionBindingId) {
		const rateLimitResponse = await applyAnonymousRateLimit({
			env: input.env,
			request: input.request,
			scope: "chat",
		});
		if (rateLimitResponse) {
			return {
				ok: false,
				response: rateLimitResponse,
			};
		}

		return {
			ok: true,
			sessionBindingId: existingSessionBindingId,
			responseHeaders: null,
		};
	}

	const turnstileSecretKey = input.env.TURNSTILE_SECRET_KEY?.trim();
	if (!turnstileSecretKey) {
		return {
			ok: false,
			response: jsonError(503, "Session verification is unavailable."),
		};
	}

	const verificationRateLimitResponse = await applyAnonymousRateLimit({
		env: input.env,
		request: input.request,
		scope: "session_verify",
	});
	if (verificationRateLimitResponse) {
		return {
			ok: false,
			response: verificationRateLimitResponse,
		};
	}

	const turnstileToken = await readTurnstileToken(
		new Request(input.request as globalThis.Request),
	);
	if (!turnstileToken) {
		return {
			ok: false,
			response: jsonError(401, "Session access required."),
		};
	}

	const verified = await verifyTurnstileToken({
		request: input.request as Request,
		token: turnstileToken,
		secretKey: turnstileSecretKey,
		expectedAction: SESSION_ACCESS_TURNSTILE_ACTION,
		expectedHostname: new URL(input.request.url).hostname,
	});
	if (!verified) {
		return {
			ok: false,
			response: jsonError(403, "Session verification failed."),
		};
	}

	const rateLimitResponse = await applyAnonymousRateLimit({
		env: input.env,
		request: input.request,
		scope: "chat",
	});
	if (rateLimitResponse) {
		return {
			ok: false,
			response: rateLimitResponse,
		};
	}

	const responseHeaders = await resolveAnonymousSessionHeaders(input.request);
	const sessionBindingId = existingSessionBindingId ?? crypto.randomUUID();
	responseHeaders.append(
		"set-cookie",
		await createSessionAccessCookie(sessionSecret, sessionBindingId),
	);

	return {
		ok: true,
		sessionBindingId,
		responseHeaders,
	};
}
