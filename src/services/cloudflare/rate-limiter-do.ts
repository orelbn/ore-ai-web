import { DurableObject } from "cloudflare:workers";
import { z } from "zod";
import type {
	RateLimitConsumeResult,
	RateLimitPolicy,
} from "@/lib/security/rate-limit";

type RateLimitCounterRecord = {
	count: number;
	windowStartMs: number;
};

type RateLimitConsumeRequest = {
	bucket: string;
	principal: string;
	policies: RateLimitPolicy[];
	nowMs?: number;
};

type RateLimitTransaction = {
	get<T = unknown>(key: string): Promise<T | undefined>;
	put<T>(key: string, value: T): Promise<void>;
};

export type RateLimitStorage = {
	transaction<T>(
		closure: (txn: RateLimitTransaction) => Promise<T>,
	): Promise<T>;
};

const rateLimitPolicySchema = z.object({
	name: z.string(),
	limit: z.number().int().positive(),
	windowSeconds: z.number().int().positive(),
});

const rateLimitConsumeRequestSchema = z.object({
	bucket: z.string(),
	principal: z.string(),
	policies: z.array(rateLimitPolicySchema),
	nowMs: z.number().optional(),
});

function buildStorageKey(input: {
	bucket: string;
	principal: string;
	policyName: string;
}) {
	return `${input.bucket}:${input.policyName}:${input.principal}`;
}

function getWindowStartMs(nowMs: number, windowSeconds: number) {
	const windowMs = windowSeconds * 1000;
	return Math.floor(nowMs / windowMs) * windowMs;
}

function getRetryAfterSeconds(
	nowMs: number,
	windowStartMs: number,
	windowSeconds: number,
) {
	const retryAfterMs = windowStartMs + windowSeconds * 1000 - nowMs;
	return Math.max(1, Math.ceil(retryAfterMs / 1000));
}

async function readCounterRecord(
	txn: RateLimitTransaction,
	key: string,
): Promise<RateLimitCounterRecord | undefined> {
	return txn.get<RateLimitCounterRecord>(key);
}

export async function consumeRateLimitCounters(input: {
	storage: RateLimitStorage;
	bucket: string;
	principal: string;
	policies: RateLimitPolicy[];
	nowMs: number;
}): Promise<RateLimitConsumeResult> {
	return input.storage.transaction(async (txn) => {
		const evaluations: Array<{
			key: string;
			policy: RateLimitPolicy;
			count: number;
			windowStartMs: number;
		}> = [];

		for (const policy of input.policies) {
			const key = buildStorageKey({
				bucket: input.bucket,
				principal: input.principal,
				policyName: policy.name,
			});
			const windowStartMs = getWindowStartMs(input.nowMs, policy.windowSeconds);
			const record = await readCounterRecord(txn, key);
			const count =
				record && record.windowStartMs === windowStartMs ? record.count : 0;

			evaluations.push({
				key,
				policy,
				count,
				windowStartMs,
			});
		}

		const blocked = evaluations.filter(
			(evaluation) => evaluation.count >= evaluation.policy.limit,
		);
		if (blocked.length > 0) {
			return {
				allowed: false,
				retryAfterSeconds: Math.max(
					...blocked.map((evaluation) =>
						getRetryAfterSeconds(
							input.nowMs,
							evaluation.windowStartMs,
							evaluation.policy.windowSeconds,
						),
					),
				),
			} satisfies RateLimitConsumeResult;
		}

		for (const evaluation of evaluations) {
			await txn.put(evaluation.key, {
				count: evaluation.count + 1,
				windowStartMs: evaluation.windowStartMs,
			} satisfies RateLimitCounterRecord);
		}

		return { allowed: true } satisfies RateLimitConsumeResult;
	});
}

function isConsumeRequest(value: unknown): value is RateLimitConsumeRequest {
	return rateLimitConsumeRequestSchema.safeParse(value).success;
}

export class RateLimiterDurableObject extends DurableObject<CloudflareEnv> {
	override async fetch(request: Request): Promise<Response> {
		if (request.method !== "POST") {
			return new Response("Method not allowed", { status: 405 });
		}

		const payload = await request.json<unknown>();
		if (!isConsumeRequest(payload)) {
			return Response.json({ error: "Invalid request." }, { status: 400 });
		}

		const result = await consumeRateLimitCounters({
			storage: createRateLimitStorage(this.ctx.storage),
			bucket: payload.bucket,
			principal: payload.principal,
			policies: payload.policies,
			nowMs: payload.nowMs ?? Date.now(),
		});

		return Response.json(result);
	}
}

function createRateLimitStorage(
	storage: DurableObjectStorage,
): RateLimitStorage {
	return {
		transaction: (closure) =>
			storage.transaction((txn) =>
				closure({
					get: (key) => txn.get(key),
					put: (key, value) => txn.put(key, value),
				}),
			),
	};
}
