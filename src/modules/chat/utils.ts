export function createEmptyChat(sessionId: string = crypto.randomUUID()): {
	sessionId: string;
	messages: [];
} {
	return {
		sessionId,
		messages: [],
	};
}
