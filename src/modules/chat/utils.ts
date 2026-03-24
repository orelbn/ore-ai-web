import type { SessionChat } from "./types";

export function createEmptySessionChat(
	sessionId: string = crypto.randomUUID(),
): SessionChat {
	return {
		sessionId,
		messages: [],
	};
}
