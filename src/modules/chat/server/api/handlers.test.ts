import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { UIMessage } from "ai";
import type { McpServiceBinding } from "@/services/mcp/types";
import { CHAT_USER_QUOTA_EXCEEDED_MESSAGE } from "../../constants";

const state = vi.hoisted<{
	createChatResponseCalls: number;
	lastCreateChatResponseInput: Record<string, unknown> | null;
	lastReportInput: Record<string, unknown> | null;
	getSessionCalls: number;
	getSessionResult: { user: { id: string } } | null;
	hasTrustedPostRequestProvenance: boolean;
	chatUserQuotaLimitCalls: number;
	lastChatUserQuotaKey: string | null;
	chatUserQuotaSuccess: boolean;
	env: {
		BETTER_AUTH_SECRET: string;
		CHAT_USER_QUOTA: RateLimit;
		GOOGLE_GENERATIVE_AI_API_KEY: string;
		MCP_INTERNAL_SHARED_SECRET: string;
		MCP_SERVER_URL: string;
		ORE_AI_MCP: McpServiceBinding;
	};
}>(() => ({
	createChatResponseCalls: 0,
	lastCreateChatResponseInput: null,
	lastReportInput: null,
	getSessionCalls: 0,
	getSessionResult: { user: { id: "user-1" } },
	hasTrustedPostRequestProvenance: true,
	chatUserQuotaLimitCalls: 0,
	lastChatUserQuotaKey: null,
	chatUserQuotaSuccess: true,
	env: {
		BETTER_AUTH_SECRET: "better-auth-secret",
		CHAT_USER_QUOTA: {
			limit: async () => ({ success: true }),
		},
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

vi.mock("../logic/create-chat-response", () => ({
	createChatResponse: async (options: Record<string, unknown>) => {
		state.createChatResponseCalls += 1;
		state.lastCreateChatResponseInput = options;
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
	reportChatRouteError: (options: Record<string, unknown>) => {
		state.lastReportInput = options;
	},
}));

vi.mock("./logging", () => ({ logChatApiEvent: () => {} }));

let handlePostChat: typeof import("./handlers").handlePostChat;

beforeAll(async () => {
	({ handlePostChat } = await import("./handlers"));
});

beforeEach(() => {
	state.createChatResponseCalls = 0;
	state.lastCreateChatResponseInput = null;
	state.lastReportInput = null;
	state.getSessionCalls = 0;
	state.getSessionResult = { user: { id: "user-1" } };
	state.hasTrustedPostRequestProvenance = true;
	state.chatUserQuotaLimitCalls = 0;
	state.lastChatUserQuotaKey = null;
	state.chatUserQuotaSuccess = true;
	state.env.BETTER_AUTH_SECRET = "better-auth-secret";
	state.env.CHAT_USER_QUOTA = {
		limit: async ({ key }: { key: string }) => {
			state.chatUserQuotaLimitCalls += 1;
			state.lastChatUserQuotaKey = key;
			return { success: state.chatUserQuotaSuccess };
		},
	};
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
		expect(state.createChatResponseCalls).toBe(0);
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
		await expect(response.text()).resolves.toBe("Session access required.");
		expect(state.getSessionCalls).toBe(1);
		expect(state.chatUserQuotaLimitCalls).toBe(0);
		expect(state.createChatResponseCalls).toBe(0);
	});

	test("should block quota-exhausted chat requests before conversation or model work", async () => {
		state.chatUserQuotaSuccess = false;

		const response = await handlePostChat(
			new Request("http://localhost/api/chat", {
				method: "POST",
				body: JSON.stringify({
					sessionId: "conversation-1",
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

		expect(response.status).toBe(429);
		await expect(response.text()).resolves.toBe(
			CHAT_USER_QUOTA_EXCEEDED_MESSAGE,
		);
		expect(state.chatUserQuotaLimitCalls).toBe(1);
		expect(state.lastChatUserQuotaKey).toBe("user:user-1");
		expect(state.createChatResponseCalls).toBe(0);
	});

	test("should create the chat response after session verification succeeds", async () => {
		const response = await handlePostChat(
			new Request("http://localhost/api/chat", {
				method: "POST",
				body: JSON.stringify({
					sessionId: "conversation-1",
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

		expect(response.status).toBe(200);
		expect(state.chatUserQuotaLimitCalls).toBe(1);
		expect(state.lastChatUserQuotaKey).toBe("user:user-1");
		expect(state.createChatResponseCalls).toBe(1);
		expect(state.lastCreateChatResponseInput).toMatchObject({
			requestId: expect.any(String),
			userId: "user-1",
			sessionId: "conversation-1",
			message: expect.objectContaining({
				id: "user-1",
				role: "user",
			}),
		});
	});
});
