import { and, desc, eq } from "drizzle-orm";
import { chatConversations } from "@/services/auth/schema";
import { getDatabase } from "@/services/database";

export async function readLatestSession(userId: string) {
  const db = getDatabase();
  return db.query.chatConversations.findFirst({
    where: eq(chatConversations.userId, userId),
    orderBy: (table) => [desc(table.updatedAt)],
  });
}

export async function readSession({ userId, sessionId }: { userId: string; sessionId: string }) {
  const db = getDatabase();
  return db.query.chatConversations.findFirst({
    where: and(eq(chatConversations.userId, userId), eq(chatConversations.id, sessionId)),
  });
}

export async function readSessionVersion(sessionId: string) {
  const db = getDatabase();
  return db.query.chatConversations.findFirst({
    where: eq(chatConversations.id, sessionId),
    columns: {
      id: true,
      userId: true,
      updatedAt: true,
    },
  });
}

export async function insertSession({
  userId,
  sessionId,
  messagesJson,
}: {
  userId: string;
  sessionId: string;
  messagesJson: string;
}) {
  const db = getDatabase();
  return db
    .insert(chatConversations)
    .values({
      id: sessionId,
      userId,
      messagesJson,
    })
    .onConflictDoNothing({ target: chatConversations.id })
    .run();
}

export async function updateSession({
  userId,
  sessionId,
  messagesJson,
  updatedAt,
}: {
  userId: string;
  sessionId: string;
  messagesJson: string;
  updatedAt: Date;
}) {
  const db = getDatabase();
  return db
    .update(chatConversations)
    .set({
      messagesJson,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(chatConversations.id, sessionId),
        eq(chatConversations.userId, userId),
        eq(chatConversations.updatedAt, updatedAt),
      ),
    )
    .run();
}
