import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { type ToolSet, ToolLoopAgent } from "ai";

const DEFAULT_AGENT_SYSTEM_PROMPT = `You are an AI agent.

Style:
- Be concise, direct, and practical.
- Prefer clear answers with useful next steps when appropriate.
- Admit uncertainty instead of guessing.

Behavior:
- Stay factual and do not invent details.
- Use tool results as the source of truth when available.
- Keep potentially risky advice cautious and non-prescriptive.
- Output plain text only.`;

const DEFAULT_MODEL = "gemini-3.1-flash-lite-preview";

export type OreAgentOptions = {
	googleApiKey: string;
	model?: string;
};

export function createOreAgent(
	options: OreAgentOptions,
	tools: ToolSet = {},
	overrideSystemPrompt?: string,
) {
	const google = createGoogleGenerativeAI({
		apiKey: options.googleApiKey,
	});

	return new ToolLoopAgent({
		model: google(options.model ?? DEFAULT_MODEL),
		instructions: overrideSystemPrompt?.trim() || DEFAULT_AGENT_SYSTEM_PROMPT,
		tools,
	});
}
