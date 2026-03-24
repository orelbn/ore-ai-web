import { and, desc, eq } from "drizzle-orm";
import { chatConversations } from "@/services/auth/schema";
import { getDatabase } from "@/services/database";

export async function readLatestSession(userId: string) {
	const database = getDatabase();
	return database.query.chatConversations.findFirst({
		where: eq(chatConversations.userId, userId),
		orderBy: (table) => [desc(table.updatedAt)],
	});
}

export async function readSession(input: {
	userId: string;
	sessionId: string;
}) {
	const database = getDatabase();
	return database.query.chatConversations.findFirst({
		where: and(
			eq(chatConversations.userId, input.userId),
			eq(chatConversations.id, input.sessionId),
		),
	});
}

export async function readSessionVersion(sessionId: string) {
	const database = getDatabase();
	return database.query.chatConversations.findFirst({
		where: eq(chatConversations.id, sessionId),
		columns: {
			id: true,
			userId: true,
			updatedAt: true,
		},
	});
}

export async function insertSession(input: {
	userId: string;
	sessionId: string;
	messagesJson: string;
}) {
	const database = getDatabase();
	return database
		.insert(chatConversations)
		.values({
			id: input.sessionId,
			userId: input.userId,
			messagesJson: input.messagesJson,
		})
		.onConflictDoNothing({ target: chatConversations.id })
		.run();
}

export async function updateSession(input: {
	userId: string;
	sessionId: string;
	messagesJson: string;
	updatedAt: Date;
}) {
	const database = getDatabase();
	return database
		.update(chatConversations)
		.set({
			messagesJson: input.messagesJson,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(chatConversations.id, input.sessionId),
				eq(chatConversations.userId, input.userId),
				eq(chatConversations.updatedAt, input.updatedAt),
			),
		)
		.run();
}
