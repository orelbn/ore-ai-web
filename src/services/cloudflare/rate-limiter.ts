import type {
	RateLimitConsumeResult,
	RateLimitPolicy,
} from "@/lib/security/rate-limit";

const RATE_LIMITER_OBJECT_NAME = "anonymous-rate-limiter";

export async function consumeCloudflareRateLimit(input: {
	namespace?: DurableObjectNamespace;
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

	return (await response.json()) as RateLimitConsumeResult;
}
