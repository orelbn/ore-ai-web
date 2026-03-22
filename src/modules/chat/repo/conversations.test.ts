import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { ConversationMessage } from "../types";

const state = vi.hoisted(() => ({
	findFirstResults: [] as Array<
		| {
				id: string;
				userId: string;
				updatedAt: Date;
		  }
		| {
				id: string;
				userId: string;
				messagesJson: string;
				updatedAt: Date;
		  }
		| null
	>,
	insertResults: [] as Array<{ meta: { changes: number } }>,
	updateResults: [] as Array<{ meta: { changes: number } }>,
	insertValues: [] as Array<Record<string, unknown>>,
	updateValues: [] as Array<Record<string, unknown>>,
}));

const database = {
	query: {
		chatConversations: {
			findFirst: vi.fn(async () => state.findFirstResults.shift() ?? null),
		},
	},
	insert: vi.fn(() => ({
		values: (values: Record<string, unknown>) => {
			state.insertValues.push(values);
			return {
				onConflictDoNothing: () => ({
					run: async () =>
						state.insertResults.shift() ?? { meta: { changes: 1 } },
				}),
			};
		},
	})),
	update: vi.fn(() => ({
		set: (values: Record<string, unknown>) => {
			state.updateValues.push(values);
			return {
				where: () => ({
					run: async () =>
						state.updateResults.shift() ?? { meta: { changes: 1 } },
				}),
			};
		},
	})),
};

vi.mock("@/services/database", () => ({
	getDatabase: () => database,
}));

let readConversation: typeof import("./conversations").readConversation;
let readConversationVersion: typeof import("./conversations").readConversationVersion;
let readLatestConversation: typeof import("./conversations").readLatestConversation;
let insertConversation: typeof import("./conversations").insertConversation;
let updateConversation: typeof import("./conversations").updateConversation;

beforeAll(async () => {
	({
		readConversation,
		readConversationVersion,
		readLatestConversation,
		insertConversation,
		updateConversation,
	} = await import("./conversations"));
});

beforeEach(() => {
	state.findFirstResults = [];
	state.insertResults = [];
	state.updateResults = [];
	state.insertValues = [];
	state.updateValues = [];
	database.query.chatConversations.findFirst.mockClear();
	database.insert.mockClear();
	database.update.mockClear();
});

function textMessage(
	id: string,
	role: ConversationMessage["role"],
	text: string,
): ConversationMessage {
	return {
		id,
		role,
		parts: [{ type: "text", text }],
	} satisfies ConversationMessage;
}

describe("conversation repo", () => {
	test("should return the latest stored conversation row for the active user", async () => {
		state.findFirstResults = [
			{
				id: "conversation-1",
				userId: "user-1",
				messagesJson: JSON.stringify([
					{
						id: "assistant-1",
						role: "assistant",
						parts: [{ type: "text", text: "hello" }],
					},
					{
						id: 123,
						role: "assistant",
						parts: [{ type: "text", text: "bad" }],
					},
					"not-a-message",
				]),
				updatedAt: new Date("2026-03-20T01:00:00.000Z"),
			},
		];

		await expect(readLatestConversation("user-1")).resolves.toEqual({
			id: "conversation-1",
			userId: "user-1",
			messagesJson: JSON.stringify([
				{
					id: "assistant-1",
					role: "assistant",
					parts: [{ type: "text", text: "hello" }],
				},
				{
					id: 123,
					role: "assistant",
					parts: [{ type: "text", text: "bad" }],
				},
				"not-a-message",
			]),
			updatedAt: new Date("2026-03-20T01:00:00.000Z"),
		});
	});

	test("should load a stored conversation for the active user", async () => {
		state.findFirstResults = [
			{
				id: "conversation-1",
				userId: "user-1",
				messagesJson: JSON.stringify([
					{
						id: "assistant-1",
						role: "assistant",
						parts: [{ type: "text", text: "hello" }],
					},
					{
						id: 123,
						role: "assistant",
						parts: [{ type: "text", text: "bad" }],
					},
					"not-a-message",
				]),
				updatedAt: new Date("2026-03-20T01:00:00.000Z"),
			},
		];

		await expect(
			readConversation({
				userId: "user-1",
				conversationId: "conversation-1",
			}),
		).resolves.toEqual({
			id: "conversation-1",
			userId: "user-1",
			messagesJson: JSON.stringify([
				{
					id: "assistant-1",
					role: "assistant",
					parts: [{ type: "text", text: "hello" }],
				},
				{
					id: 123,
					role: "assistant",
					parts: [{ type: "text", text: "bad" }],
				},
				"not-a-message",
			]),
			updatedAt: new Date("2026-03-20T01:00:00.000Z"),
		});
	});

	test("should read the save version for an existing conversation", async () => {
		const updatedAt = new Date("2026-03-20T01:00:00.000Z");
		state.findFirstResults = [
			{ id: "conversation-1", userId: "user-1", updatedAt },
		];

		await expect(readConversationVersion("conversation-1")).resolves.toEqual({
			id: "conversation-1",
			userId: "user-1",
			updatedAt,
		});
	});

	test("should insert a new conversation row", async () => {
		const messages = [textMessage("u-1", "user", "hello")];

		await expect(
			insertConversation({
				userId: "user-1",
				conversationId: "conversation-1",
				messagesJson: JSON.stringify(messages),
			}),
		).resolves.toMatchObject({ meta: { changes: 1 } });

		expect(state.insertValues).toEqual([
			{
				id: "conversation-1",
				userId: "user-1",
				messagesJson: JSON.stringify(messages),
			},
		]);
		expect(state.updateValues).toEqual([]);
	});

	test("should update an existing conversation row", async () => {
		const updatedAt = new Date("2026-03-20T01:00:00.000Z");
		await expect(
			updateConversation({
				userId: "user-1",
				conversationId: "conversation-1",
				messagesJson: JSON.stringify([textMessage("u-1", "user", "hello")]),
				updatedAt,
			}),
		).resolves.toMatchObject({ meta: { changes: 1 } });
		expect(state.updateValues).toHaveLength(1);
	});
});
