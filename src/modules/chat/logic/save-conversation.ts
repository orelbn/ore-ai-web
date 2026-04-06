import { insertSession, readSessionVersion, updateSession } from "../repo/conversations";
import type { OreAgentUIMessage } from "@/modules/agent";

export class SessionSaveConflictError extends Error {
  constructor(sessionId: string) {
    super(`Session ${sessionId} changed while a response was being persisted.`);
    this.name = "SessionSaveConflictError";
  }
}

export async function saveChat({
  userId,
  sessionId,
  messages,
}: {
  userId: string;
  sessionId: string;
  messages: OreAgentUIMessage[];
}) {
  const messagesJson = JSON.stringify(messages);
  const existingSession = await readSessionVersion(sessionId);

  if (!existingSession) {
    const insertResult = await insertSession({
      userId,
      sessionId,
      messagesJson,
    });

    if (insertResult.meta.changes > 0) return;
    throw new SessionSaveConflictError(sessionId);
  }

  const updateResult = await updateSession({
    userId,
    sessionId,
    messagesJson,
    updatedAt: existingSession.updatedAt,
  });

  if (updateResult.meta.changes > 0) return;
  throw new SessionSaveConflictError(sessionId);
}
