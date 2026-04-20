export function createEmptyChat(sessionId: string = crypto.randomUUID()) {
  return {
    sessionId,
    messages: [],
  };
}
