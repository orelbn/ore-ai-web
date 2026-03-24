import type { UIMessage } from "ai";
import type { SessionMessage } from "../types";

export function normalizeConversationHistoryMessage(
	message: UIMessage,
): SessionMessage | null {
	if (message.role === "system") {
		return null;
	}

	return message as SessionMessage;
}

export function normalizeConversationHistoryMessages(
	messages: UIMessage[],
): SessionMessage[] {
	return messages.flatMap((message) => {
		const normalized = normalizeConversationHistoryMessage(message);
		return normalized ? [normalized] : [];
	});
}
