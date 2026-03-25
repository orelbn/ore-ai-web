export function generateCspNonce(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);

	if (typeof Buffer !== "undefined") {
		return Buffer.from(bytes).toString("base64");
	}

	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary);
}

export function buildContentSecurityPolicy(nonce: string): string {
	return [
		"default-src 'none'",
		"base-uri 'none'",
		"object-src 'none'",
		"frame-ancestors 'none'",
		"form-action 'self'",
		`script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com`,
		"script-src-attr 'none'",
		"style-src 'self' https://fonts.googleapis.com",
		"style-src-attr 'none'",
		"img-src 'self'",
		"font-src 'self' https://fonts.gstatic.com",
		"connect-src 'self' https://challenges.cloudflare.com",
		"manifest-src 'self'",
		"worker-src 'none'",
		"frame-src https://challenges.cloudflare.com",
		"media-src 'none'",
		"child-src 'none'",
		"upgrade-insecure-requests",
		"block-all-mixed-content",
	].join("; ");
}
