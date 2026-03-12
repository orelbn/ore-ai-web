import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { UIMessage } from "ai";
import type { McpServiceBinding } from "@/services/mcp/types";

const state = vi.hoisted<{
	streamCalls: number;
	reportCalls: number;
	logCalls: number;
	accessResponse: Response | null;
	accessCalls: number;
	env: {
		GOOGLE_GENERATIVE_AI_API_KEY: string;
		MCP_INTERNAL_SHARED_SECRET: string;
		MCP_SERVER_URL: string;
		ORE_AI_MCP: McpServiceBinding;
	};
}>(() => ({
	streamCalls: 0,
	reportCalls: 0,
	logCalls: 0,
	accessResponse: null,
	accessCalls: 0,
	env: {
		GOOGLE_GENERATIVE_AI_API_KEY: "google-key",
		MCP_INTERNAL_SHARED_SECRET: "mcp-secret",
		MCP_SERVER_URL: "https://example.com/mcp",
		ORE_AI_MCP: {
			fetch: async () => new Response("ok"),
		},
	},
}));

vi.mock("cloudflare:workers", () => ({
	env: state.env,
}));

vi.mock("@/services/cloudflare", () => ({
	getCloudflareRequestMetadata: () => ({
		cfRay: null,
		cfColo: null,
		cfCountry: null,
	}),
}));

vi.mock("@/modules/session/server/chat-access", () => ({
	enforceChatSessionAccess: async () => {
		state.accessCalls += 1;
		return state.accessResponse;
	},
}));

vi.mock("../config/runtime-config", () => ({
	resolveChatRuntimeConfig: async () => ({
		mcpServerUrl: "https://example.com/mcp",
		agentSystemPrompt: "test prompt",
	}),
}));

vi.mock("../stream/assistant-stream", () => ({
	streamAssistantReply: async () => {
		state.streamCalls += 1;
		return new Response("ok", { status: 200 });
	},
}));

vi.mock("./request-guards", () => ({
	validateChatPostRequest: async () => ({
		messages: [
			{
				id: "user-1",
				role: "user",
				parts: [{ type: "text", text: "hello" }],
			},
		] satisfies UIMessage[],
	}),
	mapChatRequestErrorToResponse: (error: { status: number; message: string }) =>
		Response.json({ error: error.message }, { status: error.status }),
}));

vi.mock("./error-reporting", () => ({
	reportChatRouteError: () => {
		state.reportCalls += 1;
	},
}));

vi.mock("./logging", () => ({
	logChatApiEvent: () => {
		state.logCalls += 1;
	},
}));

let handlePostChat: typeof import("./handlers").handlePostChat;

beforeAll(async () => {
	({ handlePostChat } = await import("./handlers"));
});

beforeEach(() => {
	state.streamCalls = 0;
	state.reportCalls = 0;
	state.logCalls = 0;
	state.accessResponse = null;
	state.accessCalls = 0;
	state.env.GOOGLE_GENERATIVE_AI_API_KEY = "google-key";
	state.env.MCP_INTERNAL_SHARED_SECRET = "mcp-secret";
});

describe("handlePostChat", () => {
	test("blocks unauthenticated chat requests before model execution", async () => {
		state.accessResponse = Response.json(
			{ error: "Session access required." },
			{ status: 401 },
		);

		const response = await handlePostChat(
			new Request("http://localhost/api/chat", {
				method: "POST",
				body: JSON.stringify({ messages: [] }),
			}),
		);

		expect(response.status).toBe(401);
		await expect(response.json()).resolves.toEqual({
			error: "Session access required.",
		});
		expect(state.accessCalls).toBe(1);
		expect(state.streamCalls).toBe(0);
		expect(state.reportCalls).toBe(0);
		expect(state.logCalls).toBe(1);
	});

	test("blocks over-quota chat requests before model execution", async () => {
		state.accessResponse = Response.json(
			{
				error: "Too many requests. Please try again later.",
				retryAfterSeconds: 60,
			},
			{
				status: 429,
				headers: {
					"Retry-After": "60",
				},
			},
		);

		const response = await handlePostChat(
			new Request("http://localhost/api/chat", {
				method: "POST",
				body: JSON.stringify({ messages: [] }),
			}),
		);

		expect(response.status).toBe(429);
		await expect(response.json()).resolves.toEqual({
			error: "Too many requests. Please try again later.",
			retryAfterSeconds: 60,
		});
		expect(state.accessCalls).toBe(1);
		expect(state.streamCalls).toBe(0);
		expect(state.reportCalls).toBe(0);
		expect(state.logCalls).toBe(1);
	});

	test("fails closed when the MCP internal secret is missing", async () => {
		state.env.MCP_INTERNAL_SHARED_SECRET = "   ";

		const response = await handlePostChat(
			new Request("http://localhost/api/chat", {
				method: "POST",
				body: JSON.stringify({
					messages: [
						{
							id: "user-1",
							role: "user",
							parts: [{ type: "text", text: "hello" }],
						},
					],
				}),
			}),
		);

		expect(response.status).toBe(500);
		await expect(response.json()).resolves.toEqual({
			error: "Internal server error",
		});
		expect(state.accessCalls).toBe(1);
		expect(state.streamCalls).toBe(0);
		expect(state.reportCalls).toBe(1);
		expect(state.logCalls).toBe(1);
	});
});
