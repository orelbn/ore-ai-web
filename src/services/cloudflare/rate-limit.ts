import { env } from "cloudflare:workers";
import { signValue, toHex } from "@/lib/crypto";
import { TooManyRequests } from "@/lib/http/response";
import { getClientIpFromRequest } from "./client-ip";

export function withRateLimit<TArgs extends unknown[]>(
	handler: (
		request: Request,
		userId: string,
		...args: TArgs
	) => Promise<Response>,
) {
	return async (request: Request, userId: string, ...args: TArgs) => {
		const userLimitResponse = await limit(
			env.CHAT_USER_QUOTA,
			`user:${userId}`,
		);
		if (userLimitResponse) {
			return userLimitResponse;
		}

		const ipKey = await getIpRateLimitKey(request);
		if (ipKey) {
			const ipLimitResponse = await limit(env.CHAT_IP_QUOTA, ipKey);
			if (ipLimitResponse) {
				return ipLimitResponse;
			}
		}

		return await handler(request, userId, ...args);
	};
}

export async function getIpRateLimitKey(request: Request) {
	const clientIp = getClientIpFromRequest(request);
	if (!clientIp) return null;

	const signature = await signValue(clientIp, env.BETTER_AUTH_SECRET);
	return `ip:${toHex(signature).slice(0, 32)}`;
}

async function limit(rateLimit: RateLimit, key: string) {
	const { success } = await rateLimit.limit({ key });
	if (!success) return TooManyRequests();
	return null;
}
