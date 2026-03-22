import { safeValidateUIMessages } from "ai";
import { toJsonValue, type JsonValue } from "@/lib/serialization/to-json-value";
import { createEmptyConversation } from "../utils";
import type { ConversationMessage, ConversationRecord } from "../types";

type SerializedConversationRecord = {
	conversationId: string;
	messages: JsonValue[];
};

export async function parseConversationRecord(
	conversation: unknown,
): Promise<ConversationRecord> {
	try {
		if (typeof conversation !== "object" || conversation === null) {
			return createEmptyConversation();
		}

		const conversationId =
			"conversationId" in conversation
				? conversation.conversationId
				: undefined;
		if (typeof conversationId !== "string") {
			return createEmptyConversation();
		}

		const messages =
			"messages" in conversation ? conversation.messages : undefined;
		const validatedMessages = await safeValidateUIMessages<ConversationMessage>(
			{
				messages,
			},
		);

		return {
			conversationId,
			messages: validatedMessages.success ? validatedMessages.data : [],
		};
	} catch {
		return createEmptyConversation();
	}
}

export function serializeConversationRecord(
	conversation: ConversationRecord,
): SerializedConversationRecord {
	return {
		conversationId: conversation.conversationId,
		messages: conversation.messages.flatMap((message) => {
			const jsonMessage = toJsonValue(message);
			return typeof jsonMessage === "object" &&
				jsonMessage !== null &&
				!Array.isArray(jsonMessage)
				? [jsonMessage]
				: [];
		}),
	};
}
