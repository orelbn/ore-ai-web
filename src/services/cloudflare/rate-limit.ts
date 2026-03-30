import { env } from "cloudflare:workers";
import { signValue, toHex } from "@/lib/crypto";
import type { AuthenticatedHandler } from "@/types";
import { TooManyRequests } from "@/lib/http/response";
import { getClientIpFromRequest } from "./client-ip";
import type { LimiterKey, RateLimiter } from "./types";

const limiters = {
  user: userLimiter,
  ip: ipLimiter,
} satisfies Record<LimiterKey, RateLimiter>;

export function withRateLimit<TArgs extends unknown[]>(
  handler: AuthenticatedHandler<TArgs>,
  limiterKeys: LimiterKey[],
): AuthenticatedHandler<TArgs> {
  const rateLimiters = limiterKeys.map((key) => limiters[key]);
  return async (request, userId, ...args) => {
    for (const limiter of rateLimiters) {
      const rejection = await limiter(request, userId);
      if (rejection) return rejection;
    }

    return handler(request, userId, ...args);
  };
}

async function limit(rateLimit: RateLimit, key: string) {
  const { success } = await rateLimit.limit({ key });
  return success ? null : TooManyRequests();
}

function userLimiter(_request: Request, userId: string) {
  return limit(env.CHAT_USER_QUOTA, `user:${userId}`);
}

async function ipLimiter(request: Request, _userId: string) {
  const ipKey = await getIpRateLimitKey(request);
  return ipKey ? limit(env.CHAT_IP_QUOTA, ipKey) : null;
}

async function getIpRateLimitKey(request: Request) {
  const clientIp = getClientIpFromRequest(request);
  if (!clientIp) return null;

  const signature = await signValue(clientIp, env.BETTER_AUTH_SECRET);
  return `ip:${toHex(signature).slice(0, 32)}`;
}
