import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";
import { hasValidSessionAccessCookie } from "@/lib/security/session-access-cookie";

export const getSessionAccessPublicConfig = createServerFn({
	method: "GET",
}).handler(async () => {
	const request = getRequest();
	const secret = env.SESSION_ACCESS_SECRET.trim();

	return {
		turnstileSiteKey: env.TURNSTILE_SITE_KEY.trim(),
		hasSessionAccess: secret
			? await hasValidSessionAccessCookie({ request, secret })
			: false,
	};
});
