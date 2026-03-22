import { validateUIMessages } from "ai";
import { tryCatch } from "@/lib/try-catch";
import { createEmptyConversation } from "../utils";
import { normalizeConversationHistoryMessages } from "../messages/history";
import {
	readConversation,
	readLatestConversation,
} from "../repo/conversations";
import type { ConversationMessage } from "../types";

export async function loadLatestConversation(userId?: string | null) {
	if (!userId) return createEmptyConversation();

	const conversation = await readLatestConversation(userId);
	if (!conversation) return createEmptyConversation();

	return {
		conversationId: conversation.id,
		messages: await parseStoredMessages(conversation.messagesJson),
	};
}

export async function loadConversation(input: {
	userId: string;
	conversationId: string;
}) {
	const conversation = await readConversation(input);
	if (!conversation) return null;

	return {
		conversationId: conversation.id,
		messages: await parseStoredMessages(conversation.messagesJson),
	};
}

async function parseStoredMessages(
	messagesJson: string,
): Promise<ConversationMessage[]> {
	const parsed = tryCatch(JSON.parse)(messagesJson);
	if (parsed.error) {
		return [];
	}

	try {
		const validatedMessages = await validateUIMessages<ConversationMessage>({
			messages: parsed.data,
		});

		return normalizeConversationHistoryMessages(validatedMessages);
	} catch {
		return [];
	}
}
