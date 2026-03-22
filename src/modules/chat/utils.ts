import type { ConversationRecord } from "./types";

export function createEmptyConversation(
	conversationId: string = crypto.randomUUID(),
): ConversationRecord {
	return {
		conversationId,
		messages: [],
	};
}
