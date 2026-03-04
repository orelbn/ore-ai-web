import type { OreAgentUIMessage } from "@/lib/agents/ore-agent";
import { CHAT_DEFAULT_DRAFT_TITLE } from "@/lib/chat/ui-constants";
import {
	buildPreviewFromInput,
	buildTitleFromInput,
	extractPlainTextFromParts,
} from "@/lib/chat/content";

export function createSessionId() {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}

	return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function extractPlainText(parts: OreAgentUIMessage["parts"]): string {
	return extractPlainTextFromParts(parts);
}

export function buildSessionTitleFromInput(input: string): string {
	return buildTitleFromInput(input, CHAT_DEFAULT_DRAFT_TITLE);
}

export function buildSessionPreviewFromInput(input: string): string {
	return buildPreviewFromInput(input);
}

export function formatUpdatedAt(timestamp: number): string {
	return new Date(timestamp).toLocaleString([], {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const fallbackMessage = `Request failed (${response.status})`;
		let payload: { error?: string } | null = null;
		try {
			payload = (await response.json()) as { error?: string };
		} catch {
			// Ignore JSON parsing errors and use fallback message.
		}
		throw new Error(payload?.error || fallbackMessage);
	}

	return (await response.json()) as T;
}
