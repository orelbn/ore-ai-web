import {
	readConversationVersion,
	insertConversation,
	updateConversation,
} from "../repo/conversations";
import type { ConversationMessage } from "../types";

const MAX_SAVE_ATTEMPTS = 3;

export class ConversationSaveConflictError extends Error {
	constructor(conversationId: string) {
		super(
			`Conversation ${conversationId} changed while a response was being persisted.`,
		);
		this.name = "ConversationSaveConflictError";
	}
}

export async function saveConversation(input: {
	userId: string;
	conversationId: string;
	messages: ConversationMessage[];
}) {
	const messagesJson = JSON.stringify(input.messages);

	for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS; attempt += 1) {
		const existingConversation = await readConversationVersion(
			input.conversationId,
		);

		if (!existingConversation) {
			const insertResult = await insertConversation({
				userId: input.userId,
				conversationId: input.conversationId,
				messagesJson,
			});

			if (insertResult.meta.changes > 0) {
				return;
			}

			continue;
		}

		if (existingConversation.userId !== input.userId) {
			throw new Error("Conversation does not belong to the active user.");
		}

		const updateResult = await updateConversation({
			userId: input.userId,
			conversationId: input.conversationId,
			messagesJson,
			updatedAt: existingConversation.updatedAt,
		});

		if (updateResult.meta.changes > 0) {
			return;
		}
	}

	throw new ConversationSaveConflictError(input.conversationId);
}
