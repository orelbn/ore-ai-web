import type { OreAgentUIMessage } from "@/services/google-ai/ore-agent";

export type SessionMessage = OreAgentUIMessage;

export type SessionChat = {
	sessionId: string;
	messages: SessionMessage[];
};
