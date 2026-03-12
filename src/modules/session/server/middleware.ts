import { env } from "cloudflare:workers";
import { applyAnonymousRateLimit } from "@/lib/security/rate-limit";
import { requireSessionAccess } from "./verification";

type SessionAccessMiddlewareContext = {
	request: Request;
	responseHeaders: Headers;
	router?: unknown;
};

function withResponseHeaders(
	response: Response,
	responseHeaders: Headers,
): Response {
	for (const [name, value] of responseHeaders.entries()) {
		if (name === "set-cookie") {
			response.headers.append(name, value);
			continue;
		}

		if (!response.headers.has(name)) {
			response.headers.set(name, value);
		}
	}

	return response;
}

export async function applySessionAccessMiddleware(
	ctx: SessionAccessMiddlewareContext,
): Promise<Response | null> {
	const { pathname } = new URL(ctx.request.url);
	if (ctx.request.method !== "POST" || pathname !== "/api/chat") {
		return null;
	}

	const sessionSecret = (
		env as CloudflareEnv & { SESSION_ACCESS_SECRET?: string }
	).SESSION_ACCESS_SECRET?.trim();
	if (!sessionSecret) {
		return withResponseHeaders(
			Response.json(
				{ error: "Session verification is unavailable." },
				{ status: 503 },
			),
			ctx.responseHeaders,
		);
	}

	const sessionAccessResponse = await requireSessionAccess({
		request: ctx.request,
		sessionSecret,
	});
	if (sessionAccessResponse) {
		return withResponseHeaders(sessionAccessResponse, ctx.responseHeaders);
	}

	const rateLimitResponse = await applyAnonymousRateLimit({
		env,
		request: ctx.request,
		scope: "chat",
	});
	return rateLimitResponse
		? withResponseHeaders(rateLimitResponse, ctx.responseHeaders)
		: null;
}
