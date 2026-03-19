import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export const getSessionEntryConfig = createServerFn({
	method: "GET",
}).handler(() => {
	return {
		turnstileSiteKey: env.TURNSTILE_SITE_KEY.trim(),
	};
});
