import type { InferAgentUIMessage } from "ai";
import type { createOreAgent } from "@/services/google-ai/ore-agent";

export type ConversationMessage = InferAgentUIMessage<
	ReturnType<typeof createOreAgent>,
	Record<string, never>
>;

export type ConversationRecord = {
	conversationId: string;
	messages: ConversationMessage[];
};
