import { validateUIMessages } from "ai";
import { tryCatch } from "@/lib/try-catch";
import { createEmptyChat } from "../utils";
import { normalizeConversationHistoryMessages } from "../messages/history";
import { readLatestSession, readSession } from "../repo/conversations";
import type { SessionMessage } from "../types";

export async function loadLatestChat(userId?: string | null) {
	if (!userId) return createEmptyChat();

	const session = await readLatestSession(userId);
	if (!session) return createEmptyChat();

	return {
		sessionId: session.id,
		messages: await parseStoredMessages(session.messagesJson),
	};
}

export async function loadChat(userId: string, sessionId: string) {
	const session = await readSession({
		userId,
		sessionId,
	});
	if (!session) return null;

	return {
		sessionId: session.id,
		messages: await parseStoredMessages(session.messagesJson),
	};
}

async function parseStoredMessages(
	messagesJson: string,
): Promise<SessionMessage[]> {
	const parsed = tryCatch(JSON.parse)(messagesJson);
	if (parsed.error) {
		return [];
	}

	try {
		const validatedMessages = await validateUIMessages<SessionMessage>({
			messages: parsed.data,
		});

		return normalizeConversationHistoryMessages(validatedMessages);
	} catch {
		return [];
	}
}
