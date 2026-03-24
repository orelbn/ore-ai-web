import {
	insertSession,
	readSessionVersion,
	updateSession,
} from "../repo/conversations";
import type { SessionMessage } from "../types";

const MAX_SAVE_ATTEMPTS = 3;

export class SessionSaveConflictError extends Error {
	constructor(sessionId: string) {
		super(`Session ${sessionId} changed while a response was being persisted.`);
		this.name = "SessionSaveConflictError";
	}
}

export async function saveSessionChat(input: {
	userId: string;
	sessionId: string;
	messages: SessionMessage[];
}) {
	const messagesJson = JSON.stringify(input.messages);

	for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS; attempt += 1) {
		const existingSession = await readSessionVersion(input.sessionId);

		if (!existingSession) {
			const insertResult = await insertSession({
				userId: input.userId,
				sessionId: input.sessionId,
				messagesJson,
			});

			if (insertResult.meta.changes > 0) {
				return;
			}

			if (attempt < MAX_SAVE_ATTEMPTS - 1) {
				await sleep(50);
			}

			continue;
		}

		const updateResult = await updateSession({
			userId: input.userId,
			sessionId: input.sessionId,
			messagesJson,
			updatedAt: existingSession.updatedAt,
		});

		if (updateResult.meta.changes > 0) {
			return;
		}

		if (attempt < MAX_SAVE_ATTEMPTS - 1) {
			await sleep(50);
		}
	}

	throw new SessionSaveConflictError(input.sessionId);
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
