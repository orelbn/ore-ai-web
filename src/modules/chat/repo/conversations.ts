import { and, desc, eq } from "drizzle-orm";
import { chatConversations } from "@/services/auth/schema";
import { getDatabase } from "@/services/database";

export async function readLatestConversation(userId: string) {
	const database = getDatabase();
	return database.query.chatConversations.findFirst({
		where: eq(chatConversations.userId, userId),
		orderBy: (table) => [desc(table.updatedAt)],
	});
}

export async function readConversation(input: {
	userId: string;
	conversationId: string;
}) {
	const database = getDatabase();
	return database.query.chatConversations.findFirst({
		where: and(
			eq(chatConversations.userId, input.userId),
			eq(chatConversations.id, input.conversationId),
		),
	});
}

export async function readConversationVersion(conversationId: string) {
	const database = getDatabase();
	return database.query.chatConversations.findFirst({
		where: eq(chatConversations.id, conversationId),
		columns: {
			id: true,
			userId: true,
			updatedAt: true,
		},
	});
}

export async function insertConversation(input: {
	userId: string;
	conversationId: string;
	messagesJson: string;
}) {
	const database = getDatabase();
	return database
		.insert(chatConversations)
		.values({
			id: input.conversationId,
			userId: input.userId,
			messagesJson: input.messagesJson,
		})
		.onConflictDoNothing({ target: chatConversations.id })
		.run();
}

export async function updateConversation(input: {
	userId: string;
	conversationId: string;
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
				eq(chatConversations.id, input.conversationId),
				eq(chatConversations.userId, input.userId),
				eq(chatConversations.updatedAt, input.updatedAt),
			),
		)
		.run();
}
