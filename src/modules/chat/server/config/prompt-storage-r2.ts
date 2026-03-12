import { z } from "zod";
import type { PromptStorage } from "./prompt-storage";

const AGENT_PROMPTS_BINDING_NAME = "AGENT_PROMPTS";

type PromptBucket = Pick<R2Bucket, "get">;

const promptBucketSchema = z.custom<PromptBucket>((value) => {
	return (
		typeof value === "object" &&
		value !== null &&
		"get" in value &&
		typeof value.get === "function"
	);
});

const promptStorageEnvSchema = z.object({
	[AGENT_PROMPTS_BINDING_NAME]: promptBucketSchema,
});

export function createR2PromptStorage(rawEnv: unknown): PromptStorage {
	const parsed = promptStorageEnvSchema.safeParse(rawEnv);
	if (!parsed.success) {
		throw new Error(
			`${AGENT_PROMPTS_BINDING_NAME} R2 binding is required when AGENT_PROMPT_KEY is set`,
		);
	}

	const bucketCandidate = parsed.data[AGENT_PROMPTS_BINDING_NAME];
	return {
		name: "R2",
		getText: async (key: string) => {
			const object = await bucketCandidate.get(key);
			if (!object) {
				return null;
			}
			return object.text();
		},
	};
}
