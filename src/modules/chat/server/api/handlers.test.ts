import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { UIMessage } from "ai";
import type { McpServiceBinding } from "@/services/mcp/types";
import type { OreAgentUIMessage } from "@/services/google-ai/ore-agent";

const state = vi.hoisted<{
	streamCalls: number;
	lastStreamInput: Record<string, unknown> | null;
	lastReportInput: Record<string, unknown> | null;
	getSessionCalls: number;
	getSessionResult: { user: { id: string } } | null;
	hasTrustedPostRequestProvenance: boolean;
	loadSessionChatCalls: number;
	saveSessionChatCalls: Array<{
		userId: string;
		sessionId: string;
		messages: OreAgentUIMessage[];
	}>;
	saveSessionChatError: Error | null;
	env: {
		BETTER_AUTH_SECRET: string;
		GOOGLE_GENERATIVE_AI_API_KEY: string;
		MCP_INTERNAL_SHARED_SECRET: string;
		MCP_SERVER_URL: string;
		ORE_AI_MCP: McpServiceBinding;
	};
}>(() => ({
	streamCalls: 0,
	lastStreamInput: null,
	lastReportInput: null,
	getSessionCalls: 0,
	getSessionResult: { user: { id: "user-1" } },
	hasTrustedPostRequestProvenance: true,
	loadSessionChatCalls: 0,
	saveSessionChatCalls: [],
	saveSessionChatError: null,
	env: {
		BETTER_AUTH_SECRET: "better-auth-secret",
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

vi.mock("@/services/auth", () => ({
	auth: {
		api: {
			getSession: async () => {
				state.getSessionCalls += 1;
				return state.getSessionResult;
			},
		},
	},
}));

vi.mock("@/lib/security/request-provenance", () => ({
	hasTrustedPostRequestProvenance: () => state.hasTrustedPostRequestProvenance,
	buildUntrustedRequestResponse: () =>
		Response.json({ error: "Invalid request." }, { status: 403 }),
}));

vi.mock("../../logic/load-conversation", () => ({
	loadSessionChat: async () => {
		state.loadSessionChatCalls += 1;
		return {
			sessionId: "conversation-1",
			messages: [
				{
					id: "previous-user",
					role: "user",
					parts: [{ type: "text", text: "previous" }],
				},
			] satisfies OreAgentUIMessage[],
		};
	},
}));

vi.mock("../../logic/save-conversation", async () => {
	const actual = await vi.importActual<
		typeof import("../../logic/save-conversation")
	>("../../logic/save-conversation");

	return {
		...actual,
		saveSessionChat: async (input: {
			userId: string;
			sessionId: string;
			messages: OreAgentUIMessage[];
		}) => {
			state.saveSessionChatCalls.push(input);
			if (state.saveSessionChatError) {
				throw state.saveSessionChatError;
			}
		},
	};
});

vi.mock("../config/runtime-config", () => ({
	resolveChatRuntimeConfig: async () => ({
		mcpServerUrl: "https://example.com/mcp",
		agentSystemPrompt: "test prompt",
	}),
}));

vi.mock("../stream/assistant-stream", () => ({
	streamAssistantReply: async (input: Record<string, unknown>) => {
		state.streamCalls += 1;
		state.lastStreamInput = input;
		return new Response("ok", { status: 200 });
	},
}));

vi.mock("./request-guards", () => ({
	validateChatPostRequest: async () => ({
		sessionId: "conversation-1",
		message: {
			id: "user-1",
			role: "user",
			parts: [{ type: "text", text: "hello" }],
		} satisfies UIMessage,
	}),
	mapChatRequestErrorToResponse: (error: { status: number; message: string }) =>
		Response.json({ error: error.message }, { status: error.status }),
}));

vi.mock("./error-reporting", () => ({
	reportChatRouteError: (input: Record<string, unknown>) => {
		state.lastReportInput = input;
	},
}));

vi.mock("./logging", () => ({ logChatApiEvent: () => {} }));

let handlePostChat: typeof import("./handlers").handlePostChat;
let SessionSaveConflictError: typeof import("../../logic/save-conversation").SessionSaveConflictError;

beforeAll(async () => {
	({ handlePostChat } = await import("./handlers"));
	({ SessionSaveConflictError } = await import(
		"../../logic/save-conversation"
	));
});

beforeEach(() => {
	state.streamCalls = 0;
	state.lastStreamInput = null;
	state.lastReportInput = null;
	state.getSessionCalls = 0;
	state.getSessionResult = { user: { id: "user-1" } };
	state.hasTrustedPostRequestProvenance = true;
	state.loadSessionChatCalls = 0;
	state.saveSessionChatCalls = [];
	state.saveSessionChatError = null;
	state.env.BETTER_AUTH_SECRET = "better-auth-secret";
	state.env.GOOGLE_GENERATIVE_AI_API_KEY = "google-key";
	state.env.MCP_INTERNAL_SHARED_SECRET = "mcp-secret";
});

describe("handlePostChat", () => {
	test("should return 403 for untrusted chat requests before session or model work", async () => {
		state.hasTrustedPostRequestProvenance = false;

		const response = await handlePostChat(
			new Request("http://localhost/api/chat", {
				method: "POST",
				body: JSON.stringify({ messages: [] }),
			}),
		);

		expect(response.status).toBe(403);
		await expect(response.json()).resolves.toEqual({
			error: "Invalid request.",
		});
		expect(state.getSessionCalls).toBe(0);
		expect(state.loadSessionChatCalls).toBe(0);
		expect(state.streamCalls).toBe(0);
	});

	test("should block unauthenticated chat requests before model execution", async () => {
		state.getSessionResult = null;

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
		expect(state.getSessionCalls).toBe(1);
		expect(state.loadSessionChatCalls).toBe(0);
		expect(state.streamCalls).toBe(0);
	});

	test("should return successful chat responses after session verification succeeds", async () => {
		const response = await handlePostChat(
			new Request("http://localhost/api/chat", {
				method: "POST",
				body: JSON.stringify({
					sessionId: "conversation-1",
					message: {
						id: "user-1",
						role: "user",
						parts: [{ type: "text", text: "hello" }],
					},
				}),
			}),
		);

		expect(response.status).toBe(200);
		expect(state.lastStreamInput).toMatchObject({
			actorId: "user-1",
			messages: [
				expect.objectContaining({ id: "previous-user" }),
				expect.objectContaining({ id: "user-1" }),
			],
		});
		const onFinishMessages = state.lastStreamInput?.onFinishMessages;
		expect(typeof onFinishMessages).toBe("function");
		if (typeof onFinishMessages !== "function") {
			throw new Error("Expected stream input to expose onFinishMessages");
		}
		await onFinishMessages([
			{
				id: "previous-user",
				role: "user",
				parts: [{ type: "text", text: "previous" }],
			},
			{
				id: "user-1",
				role: "user",
				parts: [{ type: "text", text: "hello" }],
			},
			{
				id: "assistant-1",
				role: "assistant",
				parts: [{ type: "text", text: "hi" }],
			},
		]);
		expect(state.saveSessionChatCalls).toEqual([
			{
				userId: "user-1",
				sessionId: "conversation-1",
				messages: [
					{
						id: "previous-user",
						role: "user",
						parts: [{ type: "text", text: "previous" }],
					},
					{
						id: "user-1",
						role: "user",
						parts: [{ type: "text", text: "hello" }],
					},
					{
						id: "assistant-1",
						role: "assistant",
						parts: [{ type: "text", text: "hi" }],
					},
				],
			},
		]);
	});

	test("should report and swallow conversation save conflicts after the stream finishes", async () => {
		const response = await handlePostChat(
			new Request("http://localhost/api/chat", {
				method: "POST",
				body: JSON.stringify({
					sessionId: "conversation-1",
					message: {
						id: "user-1",
						role: "user",
						parts: [{ type: "text", text: "hello" }],
					},
				}),
			}),
		);

		expect(response.status).toBe(200);
		const onFinishMessages = state.lastStreamInput?.onFinishMessages;
		expect(typeof onFinishMessages).toBe("function");
		if (typeof onFinishMessages !== "function") {
			throw new Error("Expected stream input to expose onFinishMessages");
		}

		state.saveSessionChatError = new SessionSaveConflictError("conversation-1");

		await expect(
			onFinishMessages([
				{
					id: "previous-user",
					role: "user",
					parts: [{ type: "text", text: "previous" }],
				},
				{
					id: "user-1",
					role: "user",
					parts: [{ type: "text", text: "hello" }],
				},
				{
					id: "assistant-1",
					role: "assistant",
					parts: [{ type: "text", text: "hi" }],
				},
			]),
		).resolves.toBeUndefined();

		expect(state.saveSessionChatCalls).toHaveLength(1);
		expect(state.lastReportInput).toEqual(
			expect.objectContaining({
				route: "/api/chat",
				stage: "persist_conflict",
				userId: "user-1",
				chatId: "conversation-1",
				error: expect.any(SessionSaveConflictError),
			}),
		);
	});
});
