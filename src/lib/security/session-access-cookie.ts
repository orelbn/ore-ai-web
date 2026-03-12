import {
	decodeSignedCookiePayload,
	encodeSignedCookiePayload,
	getCookieValue,
	hasValidCookieSignature,
	signCookiePayload,
} from "./signed-cookie";
import {
	SESSION_ACCESS_COOKIE_MAX_AGE_SECONDS,
	SESSION_ACCESS_COOKIE_NAME,
} from "@/modules/session/constants";
import { z } from "zod";

type VerificationCookiePayload = {
	exp: number;
};

const verificationCookiePayloadSchema = z.object({
	exp: z.number(),
});

export async function hasValidSessionAccessCookie(input: {
	request: Request;
	secret: string;
	now?: Date;
}): Promise<boolean> {
	const rawValue = getCookieValue(input.request, SESSION_ACCESS_COOKIE_NAME);
	if (!rawValue) {
		return false;
	}

	const [payloadPart, signaturePart] = rawValue.split(".");
	if (!payloadPart || !signaturePart) {
		return false;
	}

	const isValidSignature = await hasValidCookieSignature({
		encodedPayload: payloadPart,
		signature: signaturePart,
		secret: input.secret,
	});
	if (!isValidSignature) {
		return false;
	}

	const payloadJson = decodeSignedCookiePayload(payloadPart);
	if (!payloadJson) {
		return false;
	}

	try {
		const parsed = verificationCookiePayloadSchema.safeParse(
			JSON.parse(payloadJson),
		);
		if (!parsed.success) {
			return false;
		}

		const now = input.now ?? new Date();
		return parsed.data.exp > now.getTime();
	} catch {
		return false;
	}
}

export async function createSessionAccessCookie(
	secret: string,
): Promise<string> {
	const payload: VerificationCookiePayload = {
		exp: Date.now() + SESSION_ACCESS_COOKIE_MAX_AGE_SECONDS * 1000,
	};
	const payloadPart = encodeSignedCookiePayload(JSON.stringify(payload));
	const signaturePart = await signCookiePayload(payloadPart, secret);
	return [
		`${SESSION_ACCESS_COOKIE_NAME}=${payloadPart}.${signaturePart}`,
		`Max-Age=${SESSION_ACCESS_COOKIE_MAX_AGE_SECONDS}`,
		"Path=/",
		"HttpOnly",
		"Secure",
		"SameSite=Lax",
	].join("; ");
}
