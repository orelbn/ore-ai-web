import type { UIMessage } from "ai";

export function getSerializedByteSize(value: unknown): number {
	return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

export function groupMessagesIntoTurns<UI_MESSAGE extends UIMessage>(
	messages: UI_MESSAGE[],
): UI_MESSAGE[][] {
	const turns: UI_MESSAGE[][] = [];
	let currentTurn: UI_MESSAGE[] = [];

	for (const message of messages) {
		if (message.role === "user" && currentTurn.length > 0) {
			turns.push(currentTurn);
			currentTurn = [message];
			continue;
		}

		currentTurn.push(message);
	}

	if (currentTurn.length > 0) {
		turns.push(currentTurn);
	}

	return turns;
}

export function selectMessagesByTurnSize<UI_MESSAGE extends UIMessage>({
	messages,
	maxBytes,
}: {
	messages: UI_MESSAGE[];
	maxBytes: number;
}): UI_MESSAGE[] {
	if (messages.length === 0) {
		return [];
	}

	const turns = groupMessagesIntoTurns(messages);
	const selectedTurns: UI_MESSAGE[][] = [];
	let totalBytes = 0;

	for (let index = turns.length - 1; index >= 0; index -= 1) {
		const turn = turns[index];
		const nextTurns = [turn, ...selectedTurns];
		const nextBytes = getSerializedByteSize(nextTurns.flat());

		if (selectedTurns.length === 0 || nextBytes <= maxBytes) {
			selectedTurns.unshift(turn);
			totalBytes = nextBytes;
			continue;
		}

		void totalBytes;
		break;
	}

	return selectedTurns.flat();
}
