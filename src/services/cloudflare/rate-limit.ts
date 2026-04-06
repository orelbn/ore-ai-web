import { env } from "cloudflare:workers";
import { signValue, toHex } from "@/lib/crypto";
import type { AuthenticatedHandler } from "@/types";
import { TooManyRequests } from "@/lib/http/response";
import { getClientIpFromRequest } from "./client-ip";
import type { LimiterKey, RateLimiter, RateLimitScope } from "./types";

const limiters = {
  chat: {
    user: (request, userId) => userLimiter(request, userId, env.CHAT_USER_QUOTA),
    ip: (request, userId) => ipLimiter(request, userId, env.CHAT_IP_QUOTA),
  },
  transcription: {
    user: (request, userId) => userLimiter(request, userId, env.TRANSCRIPTION_USER_QUOTA),
    ip: (request, userId) => ipLimiter(request, userId, env.TRANSCRIPTION_IP_QUOTA),
  },
} satisfies Record<RateLimitScope, Record<LimiterKey, RateLimiter>>;

export function withRateLimit<TArgs extends unknown[]>(
  handler: AuthenticatedHandler<TArgs>,
  scope: RateLimitScope,
  limiterKeys: LimiterKey[],
): AuthenticatedHandler<TArgs> {
  const rateLimiters = limiterKeys.map((key) => limiters[scope][key]);
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

function userLimiter(_request: Request, userId: string, rateLimit: RateLimit) {
  return limit(rateLimit, `user:${userId}`);
}

async function ipLimiter(request: Request, _userId: string, rateLimit: RateLimit) {
  return ipLimiterWithBinding(request, rateLimit);
}

async function ipLimiterWithBinding(request: Request, rateLimit: RateLimit) {
  const ipKey = await getIpRateLimitKey(request);
  return ipKey ? limit(rateLimit, ipKey) : null;
}

async function getIpRateLimitKey(request: Request) {
  const clientIp = getClientIpFromRequest(request);
  if (!clientIp) return null;

  const signature = await signValue(clientIp, env.BETTER_AUTH_SECRET);
  return `ip:${toHex(signature).slice(0, 32)}`;
}
