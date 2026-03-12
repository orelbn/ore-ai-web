import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { OreAgentUIMessage } from "@/services/google-ai/ore-agent";
import {
	clearStoredConversation,
	persistConversation,
	readStoredConversation,
} from "./conversation-storage";

type StorageMap = Map<string, string>;

function createStorage(map: StorageMap): Storage {
	return {
		getItem: (key) => map.get(key) ?? null,
		setItem: (key, value) => {
			map.set(key, value);
		},
		removeItem: (key) => {
			map.delete(key);
		},
		clear: () => map.clear(),
		key: (index) => Array.from(map.keys())[index] ?? null,
		get length() {
			return map.size;
		},
	} satisfies Storage;
}

const storageMap: StorageMap = new Map();

beforeEach(() => {
	storageMap.clear();
	vi.stubGlobal("window", {
		sessionStorage: createStorage(storageMap),
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
});

function textMessage(
	id: string,
	role: OreAgentUIMessage["role"],
	text: string,
) {
	return {
		id,
		role,
		parts: [{ type: "text", text }],
	} satisfies OreAgentUIMessage;
}

describe("conversation storage", () => {
	test("persists and hydrates messages", () => {
		persistConversation([textMessage("m-1", "user", "hello")]);

		expect(readStoredConversation()).toEqual([
			textMessage("m-1", "user", "hello"),
		]);
	});

	test("clears corrupt payloads", () => {
		storageMap.set("ore-ai:chat-session:v1", "{bad json");

		expect(readStoredConversation()).toEqual([]);
		expect(storageMap.has("ore-ai:chat-session:v1")).toBe(false);
	});

	test("clearStoredConversation removes saved state", () => {
		persistConversation([textMessage("m-1", "user", "hello")]);

		clearStoredConversation();

		expect(readStoredConversation()).toEqual([]);
	});
});
