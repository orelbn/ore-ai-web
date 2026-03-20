import type { UIMessage } from "ai";
import type { ConversationMessage } from "../types";
import { extractPlainTextFromParts } from "./content";

export function normalizeConversationHistoryMessage(
	message: UIMessage,
): ConversationMessage | null {
	if (message.role === "system") {
		return null;
	}

	if (message.role === "user") {
		return {
			id: message.id,
			role: "user",
			parts: message.parts.flatMap((part) =>
				part.type === "text"
					? [
							{
								type: "text" as const,
								text: part.text,
							},
						]
					: [],
			),
		};
	}

	const text = extractPlainTextFromParts(message.parts);
	if (!text) {
		return null;
	}

	return {
		id: message.id,
		role: "assistant",
		parts: [{ type: "text", text }],
	};
}

export function normalizeConversationHistoryMessages(
	messages: UIMessage[],
): ConversationMessage[] {
	return messages.flatMap((message) => {
		const normalized = normalizeConversationHistoryMessage(message);
		return normalized ? [normalized] : [];
	});
}
