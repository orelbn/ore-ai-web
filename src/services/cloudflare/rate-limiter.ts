import type {
	RateLimitConsumeResult,
	RateLimitPolicy,
} from "@/lib/security/rate-limit";
import { z } from "zod";

const RATE_LIMITER_OBJECT_NAME = "anonymous-rate-limiter";

const rateLimitConsumeResultSchema = z.union([
	z.object({
		allowed: z.literal(true),
	}),
	z.object({
		allowed: z.literal(false),
		retryAfterSeconds: z.number().int().positive(),
	}),
]);

export interface RateLimiterNamespace {
	getByName(name: string): Pick<DurableObjectStub, "fetch">;
}

export async function consumeCloudflareRateLimit(input: {
	namespace?: RateLimiterNamespace;
	bucket: string;
	principal: string;
	policies: RateLimitPolicy[];
	nowMs?: number;
}): Promise<RateLimitConsumeResult> {
	if (!input.namespace) {
		throw new Error("Rate limiter binding is unavailable.");
	}

	const stub = input.namespace.getByName(RATE_LIMITER_OBJECT_NAME);
	const response = await stub.fetch("https://internal-rate-limiter/consume", {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({
			bucket: input.bucket,
			principal: input.principal,
			policies: input.policies,
			nowMs: input.nowMs,
		}),
	});

	if (!response.ok) {
		throw new Error(
			`Rate limiter request failed with status ${response.status}.`,
		);
	}

	const parsed = rateLimitConsumeResultSchema.safeParse(await response.json());
	if (!parsed.success) {
		throw new Error("Rate limiter returned an invalid response.");
	}

	return parsed.data satisfies RateLimitConsumeResult;
}
