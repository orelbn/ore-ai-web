import { afterEach, describe, expect, mock, test } from "bun:test";
import { deleteChat, getChat, listChats } from "./client";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe("chat client", () => {
	test("listChats returns parsed data", async () => {
		globalThis.fetch = mock(async () => {
			return Response.json({
				chats: [
					{
						id: "chat-1",
						title: "Roadmap",
						updatedAt: 1700000000000,
						lastMessagePreview: "Plan Q2 work",
					},
				],
			});
		}) as unknown as typeof fetch;

		const payload = await listChats();
		expect(payload.chats).toHaveLength(1);
		expect(payload.chats[0]?.id).toBe("chat-1");
	});

	test("getChat returns parsed data", async () => {
		globalThis.fetch = mock(async () => {
			return Response.json({
				id: "chat-1",
				title: "Roadmap",
				messages: [
					{ id: "m-1", role: "user", parts: [{ type: "text", text: "hi" }] },
				],
			});
		}) as unknown as typeof fetch;

		const payload = await getChat("chat-1");
		expect(payload.id).toBe("chat-1");
		expect(payload.messages).toHaveLength(1);
	});

	test("throws API error message when request fails with error payload", async () => {
		globalThis.fetch = mock(async () => {
			return new Response(JSON.stringify({ error: "Forbidden" }), {
				status: 403,
				headers: { "content-type": "application/json" },
			});
		}) as unknown as typeof fetch;

		await expect(deleteChat("chat-1")).rejects.toThrow("Forbidden");
	});

	test("falls back to status message when error payload is unavailable", async () => {
		globalThis.fetch = mock(async () => {
			return new Response("not-json", {
				status: 500,
				headers: { "content-type": "text/plain" },
			});
		}) as unknown as typeof fetch;

		await expect(listChats()).rejects.toThrow("Request failed (500)");
	});
});
