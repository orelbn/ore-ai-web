import { env } from "cloudflare:workers";
import {
	createSessionAccessCookie,
	hasValidSessionAccessCookie,
} from "@/lib/security/session-access-cookie";
import { z } from "zod";
import { applyAnonymousRateLimit } from "@/lib/security/rate-limit";
import { isRecord } from "@/lib/type-guards";
import { verifyTurnstileToken } from "@/services/cloudflare";
import {
	SESSION_ACCESS_TURNSTILE_ACTION,
	SESSION_VERIFY_MAX_BODY_BYTES,
} from "../constants";

function jsonError(status: number, error: string): Response {
	return Response.json({ error }, { status });
}

const verificationRequestBodySchema = z.object({
	token: z.string().trim().min(1),
});

function parseToken(rawBody: string): string | null {
	try {
		const payload = JSON.parse(rawBody);
		if (!isRecord(payload)) {
			return null;
		}

		const parsed = verificationRequestBodySchema.safeParse(payload);
		return parsed.success ? parsed.data.token : null;
	} catch {
		return null;
	}
}

function assertVerificationRequestBodySize(
	headers: Headers,
	rawBody: string,
): void {
	const contentLength = headers.get("content-length");
	if (contentLength) {
		const lengthValue = Number.parseInt(contentLength, 10);
		if (
			Number.isFinite(lengthValue) &&
			lengthValue > SESSION_VERIFY_MAX_BODY_BYTES
		) {
			throw new Error("Verification request body is too large.");
		}
	}

	const encodedLength = new TextEncoder().encode(rawBody).byteLength;
	if (encodedLength > SESSION_VERIFY_MAX_BODY_BYTES) {
		throw new Error("Verification request body is too large.");
	}
}

export async function requireSessionAccess(input: {
	request: Request;
	sessionSecret: string;
}): Promise<Response | null> {
	const hasSessionAccess = await hasValidSessionAccessCookie({
		request: input.request,
		secret: input.sessionSecret,
	});

	if (hasSessionAccess) {
		return null;
	}

	return jsonError(401, "Session access required.");
}

export async function handlePostSessionVerify(
	request: Request,
): Promise<Response> {
	const turnstileSecretKey = env.TURNSTILE_SECRET_KEY.trim();
	const sessionSecret = env.SESSION_ACCESS_SECRET.trim();

	if (!turnstileSecretKey || !sessionSecret) {
		throw new Error("Missing session verification configuration.");
	}

	const rawBody = await request.text();
	try {
		assertVerificationRequestBodySize(request.headers, rawBody);
	} catch {
		return jsonError(413, "Invalid request.");
	}
	const token = parseToken(rawBody);
	if (!token) {
		return jsonError(400, "Invalid request.");
	}

	const rateLimitResponse = await applyAnonymousRateLimit({
		env,
		request,
		scope: "session_verify",
	});
	if (rateLimitResponse) {
		return rateLimitResponse;
	}

	const verified = await verifyTurnstileToken({
		request,
		token,
		secretKey: turnstileSecretKey,
		expectedAction: SESSION_ACCESS_TURNSTILE_ACTION,
		expectedHostname: new URL(request.url).hostname,
	});
	if (!verified) {
		return jsonError(403, "Session verification failed.");
	}

	const response = new Response(null, { status: 204 });
	response.headers.append(
		"Set-Cookie",
		await createSessionAccessCookie(sessionSecret),
	);
	return response;
}
