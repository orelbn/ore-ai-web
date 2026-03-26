import type { SessionChat } from "./types";

export function createEmptyChat(
	sessionId: string = crypto.randomUUID(),
): SessionChat {
	return {
		sessionId,
		messages: [],
	};
}
