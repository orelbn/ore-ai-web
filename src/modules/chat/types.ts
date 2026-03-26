import type { OreAgentUIMessage } from "@/modules/agent";

export type SessionMessage = OreAgentUIMessage;

export type SessionChat = {
	sessionId: string;
	messages: SessionMessage[];
};
