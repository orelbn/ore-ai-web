import type { HandlerCallback } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { requireSessionAccess } from "./verification";

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
	ctx: Parameters<HandlerCallback<any>>[0],
): Promise<Response | null> {
	const { pathname } = new URL(ctx.request.url);
	if (pathname !== "/api/chat") {
		return null;
	}

	const sessionSecret = (
		env as CloudflareEnv & { HUMAN_VERIFICATION_SECRET?: string }
	).HUMAN_VERIFICATION_SECRET?.trim();
	if (!sessionSecret) {
		return withResponseHeaders(
			Response.json(
				{ error: "Session verification is unavailable." },
				{ status: 500 },
			),
			ctx.responseHeaders,
		);
	}

	const sessionAccessResponse = await requireSessionAccess({
		request: ctx.request,
		sessionSecret,
	});
	return sessionAccessResponse
		? withResponseHeaders(sessionAccessResponse, ctx.responseHeaders)
		: null;
}
