import type { OreAgentUIMessage } from "@/services/google-ai/ore-agent";
import { z } from "zod";
import { CHAT_STORAGE_MAX_BYTES } from "../workspace/constants";
import {
	getSerializedByteSize,
	trimMessagesToByteBudget,
} from "./context-window";

const STORAGE_KEY = "ore-ai:chat-session:v1";
const STORAGE_VERSION = 1;

type StoredConversationV1 = {
	version: 1;
	messages: OreAgentUIMessage[];
};

const oreAgentMessageSchema = z.custom<OreAgentUIMessage>((value) => {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		typeof value.id === "string" &&
		"role" in value &&
		(value.role === "system" ||
			value.role === "user" ||
			value.role === "assistant") &&
		"parts" in value &&
		Array.isArray(value.parts)
	);
});

const storedConversationSchema = z.object({
	version: z.literal(STORAGE_VERSION),
	messages: z.array(oreAgentMessageSchema),
});

function getStorage(): Storage | null {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
}

function buildStoredConversation(
	messages: OreAgentUIMessage[],
): StoredConversationV1 {
	return {
		version: STORAGE_VERSION,
		messages,
	};
}

export function readStoredConversation(): OreAgentUIMessage[] {
	const storage = getStorage();
	if (!storage) {
		return [];
	}

	try {
		const rawValue = storage.getItem(STORAGE_KEY);
		if (!rawValue) {
			return [];
		}

		const parsed = storedConversationSchema.safeParse(JSON.parse(rawValue));
		if (!parsed.success) {
			storage.removeItem(STORAGE_KEY);
			return [];
		}

		return parsed.data.messages;
	} catch {
		storage.removeItem(STORAGE_KEY);
		return [];
	}
}

export function clearStoredConversation() {
	const storage = getStorage();
	storage?.removeItem(STORAGE_KEY);
}

export function persistConversation(messages: OreAgentUIMessage[]) {
	const storage = getStorage();
	if (!storage) {
		return;
	}

	let nextMessages = trimMessagesToByteBudget({
		messages,
		maxBytes: CHAT_STORAGE_MAX_BYTES,
	});

	while (nextMessages.length > 0) {
		try {
			storage.setItem(
				STORAGE_KEY,
				JSON.stringify(buildStoredConversation(nextMessages)),
			);
			return;
		} catch {
			const trimmedMessages = trimMessagesToByteBudget({
				messages: nextMessages.slice(1),
				maxBytes: Math.max(
					Math.floor(getSerializedByteSize(nextMessages) / 2),
					1024,
				),
			});

			if (trimmedMessages.length >= nextMessages.length) {
				nextMessages = nextMessages.slice(-1);
				continue;
			}

			nextMessages = trimmedMessages;
		}
	}

	storage.removeItem(STORAGE_KEY);
}
