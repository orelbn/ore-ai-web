import { getActiveSessionUserId } from "@/modules/session";
import { env } from "cloudflare:workers";

export type IndexRouteLoaderData = {
	initialHasSession: boolean;
	turnstileSiteKey: string;
};

export async function loadIndexRouteData(
	requestHeaders: Headers,
): Promise<IndexRouteLoaderData> {
	const userId = await getActiveSessionUserId(requestHeaders);

	return {
		initialHasSession: Boolean(userId),
		turnstileSiteKey: env.TURNSTILE_SITE_KEY?.trim() ?? "",
	};
}
