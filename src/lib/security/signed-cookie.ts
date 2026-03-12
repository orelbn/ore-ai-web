function encodeBase64Url(value: Uint8Array): string {
	const base64 = Buffer.from(value).toString("base64");
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): Uint8Array | null {
	try {
		const padding =
			value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
		const normalized = value.replace(/-/g, "+").replace(/_/g, "/") + padding;
		return new Uint8Array(Buffer.from(normalized, "base64"));
	} catch {
		return null;
	}
}

function constantTimeEqual(left: string, right: string): boolean {
	const leftBytes = new TextEncoder().encode(left);
	const rightBytes = new TextEncoder().encode(right);
	const maxLength = Math.max(leftBytes.length, rightBytes.length);
	let diff = leftBytes.length === rightBytes.length ? 0 : 1;

	for (let index = 0; index < maxLength; index += 1) {
		diff |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
	}

	return diff === 0;
}

async function createSignature(
	payload: string,
	secret: string,
): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(payload),
	);
	return encodeBase64Url(new Uint8Array(signature));
}

export function encodeSignedCookiePayload(payload: string): string {
	return encodeBase64Url(new TextEncoder().encode(payload));
}

export function decodeSignedCookiePayload(payload: string): string | null {
	const bytes = decodeBase64Url(payload);
	if (!bytes) {
		return null;
	}

	try {
		return new TextDecoder().decode(bytes);
	} catch {
		return null;
	}
}

export async function signCookiePayload(
	encodedPayload: string,
	secret: string,
): Promise<string> {
	return createSignature(encodedPayload, secret);
}

export async function hasValidCookieSignature(input: {
	encodedPayload: string;
	signature: string;
	secret: string;
}): Promise<boolean> {
	const expectedSignature = await createSignature(
		input.encodedPayload,
		input.secret,
	);
	return constantTimeEqual(input.signature, expectedSignature);
}

export function getCookieValue(request: Request, name: string): string | null {
	const rawCookie = request.headers.get("cookie");
	if (!rawCookie) {
		return null;
	}

	for (const cookiePart of rawCookie.split(";")) {
		const [cookieName, ...cookieValueParts] = cookiePart.trim().split("=");
		if (cookieName === name) {
			return cookieValueParts.join("=") || null;
		}
	}

	return null;
}
