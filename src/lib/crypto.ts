import { toHex } from "./utils";

const enc = new TextEncoder();

export async function signValue(value: string, secret: string) {
	const key = await crypto.subtle.importKey(
		"raw",
		enc.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
	return new Uint8Array(sig);
}

export { toHex };
