import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";
import { hasValidHumanVerificationCookie } from "@/lib/security/human-verification-cookie";

export const getSessionAccessPublicConfig = createServerFn({
	method: "GET",
}).handler(async () => {
	const request = getRequest();
	const secret = (
		env as CloudflareEnv & { SESSION_ACCESS_SECRET?: string }
	).SESSION_ACCESS_SECRET?.trim();

	return {
		turnstileSiteKey:
			(
				env as CloudflareEnv & { TURNSTILE_SITE_KEY?: string }
			).TURNSTILE_SITE_KEY?.trim() || "",
		hasSessionAccess: secret
			? await hasValidHumanVerificationCookie({ request, secret })
			: false,
	};
});
