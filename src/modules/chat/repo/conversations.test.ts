import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { OreAgentUIMessage } from "@/modules/agent";

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

let readSession: typeof import("./conversations").readSession;
let readSessionVersion: typeof import("./conversations").readSessionVersion;
let readLatestSession: typeof import("./conversations").readLatestSession;
let insertSession: typeof import("./conversations").insertSession;
let updateSession: typeof import("./conversations").updateSession;

beforeAll(async () => {
	({
		readSession,
		readSessionVersion,
		readLatestSession,
		insertSession,
		updateSession,
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
	role: OreAgentUIMessage["role"],
	text: string,
): OreAgentUIMessage {
	return {
		id,
		role,
		parts: [{ type: "text", text }],
	} satisfies OreAgentUIMessage;
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

		await expect(readLatestSession("user-1")).resolves.toEqual({
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
			readSession({
				userId: "user-1",
				sessionId: "conversation-1",
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

		await expect(readSessionVersion("conversation-1")).resolves.toEqual({
			id: "conversation-1",
			userId: "user-1",
			updatedAt,
		});
	});

	test("should insert a new conversation row", async () => {
		const messages = [textMessage("u-1", "user", "hello")];

		await expect(
			insertSession({
				userId: "user-1",
				sessionId: "conversation-1",
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
			updateSession({
				userId: "user-1",
				sessionId: "conversation-1",
				messagesJson: JSON.stringify([textMessage("u-1", "user", "hello")]),
				updatedAt,
			}),
		).resolves.toMatchObject({ meta: { changes: 1 } });
		expect(state.updateValues).toHaveLength(1);
	});
});
