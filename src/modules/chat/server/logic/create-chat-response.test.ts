import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";
import type { OreAgentUIMessage } from "@/modules/agent";

const state = vi.hoisted(() => ({
	createStreamCalls: 0,
	closeCalls: 0,
	lastStreamInput: null as Record<string, unknown> | null,
	persistedChats: [] as Array<{
		userId: string;
		sessionId: string;
		messages: OreAgentUIMessage[];
	}>,
	saveChatError: null as Error | null,
}));

vi.mock("cloudflare:workers", () => ({
	env: {
		GOOGLE_GENERATIVE_AI_API_KEY: "google-key",
		MCP_INTERNAL_SHARED_SECRET: "mcp-secret",
		ORE_AI_MCP: {
			fetch: async () => new Response("ok"),
		},
	},
}));

vi.mock("ai", () => ({
	createAgentUIStreamResponse: (options: unknown) => {
		state.createStreamCalls += 1;
		state.lastStreamInput = options as Record<string, unknown>;
		return new Response("stream", { status: 200 });
	},
}));

vi.mock("@/modules/agent/server", () => ({
	createOreAgent: () => ({ type: "mock-agent" }),
}));

vi.mock("@/services/mcp/ore-ai-mcp-tools", () => ({
	resolveOreAiMcpTools: async () => ({
		tools: {},
		close: async () => {
			state.closeCalls += 1;
		},
	}),
}));

vi.mock("../config/runtime-config", () => ({
	resolveChatRuntimeConfig: async () => ({
		mcpServerUrl: "https://example.com/mcp",
		agentSystemPrompt: "test prompt",
	}),
}));

vi.mock("../../logic/load-conversation", () => ({
	loadChat: async () => ({
		sessionId: "conversation-1",
		messages: [
				{
					id: "previous-user",
					role: "user",
					parts: [{ type: "text", text: "previous" }],
				},
			] satisfies OreAgentUIMessage[],
		}),
	}));

vi.mock("../../logic/save-conversation", async () => {
	const actual = await vi.importActual<
		typeof import("../../logic/save-conversation")
	>("../../logic/save-conversation");

	return {
		...actual,
			saveChat: async (options: {
				userId: string;
				sessionId: string;
				messages: OreAgentUIMessage[];
			}) => {
			state.persistedChats.push(options);
			if (state.saveChatError) {
				throw state.saveChatError;
			}
		},
	};
});

let createChatResponse: typeof import("./create-chat-response").createChatResponse;
let SessionSaveConflictError: typeof import("../../logic/save-conversation").SessionSaveConflictError;

beforeAll(async () => {
	({ createChatResponse } = await import("./create-chat-response"));
	({ SessionSaveConflictError } = await import(
		"../../logic/save-conversation"
	));
});

beforeEach(() => {
	state.createStreamCalls = 0;
	state.closeCalls = 0;
	state.lastStreamInput = null;
	state.persistedChats = [];
	state.saveChatError = null;
});

afterEach(() => {
	vi.restoreAllMocks();
});

function textMessage(
	id: string,
	role: OreAgentUIMessage["role"],
	text: string,
): OreAgentUIMessage {
	return { id, role, parts: [{ type: "text", text }] };
}

function getLastStreamInput() {
	if (!state.lastStreamInput) {
		throw new Error(
			"Expected createAgentUIStreamResponse to receive stream options",
		);
	}

	return state.lastStreamInput;
}

function isOnFinish(
	value: unknown,
): value is (event: { messages: OreAgentUIMessage[] }) => Promise<void> {
	return typeof value === "function";
}

function isOnError(value: unknown): value is () => string {
	return typeof value === "function";
}

describe("createChatResponse", () => {
		test("should persist normalized messages and close MCP tools when the stream finishes", async () => {
			const response = await createChatResponse({
				requestId: "request-1",
				userId: "user-1",
				sessionId: "conversation-1",
			message: textMessage("user-1", "user", "hello"),
		});

		expect(response.status).toBe(200);
		expect(state.createStreamCalls).toBe(1);
		expect(getLastStreamInput()).toMatchObject({
			uiMessages: [
				expect.objectContaining({ id: "previous-user" }),
				expect.objectContaining({ id: "user-1" }),
			],
		});

		const onFinish = getLastStreamInput().onFinish;
		expect(isOnFinish(onFinish)).toBe(true);
		if (!isOnFinish(onFinish)) {
			throw new Error("Expected onFinish to be exposed");
		}

		await onFinish({
			messages: [
				textMessage("previous-user", "user", "previous"),
				textMessage("user-1", "user", "hello"),
				textMessage("assistant-1", "assistant", "hi"),
			],
		});

		expect(state.persistedChats).toEqual([
			{
				userId: "user-1",
				sessionId: "conversation-1",
				messages: [
					textMessage("previous-user", "user", "previous"),
					textMessage("user-1", "user", "hello"),
					textMessage("assistant-1", "assistant", "hi"),
				],
			},
		]);
		expect(state.closeCalls).toBe(1);
	});

	test("should report save conflicts and still close MCP tools", async () => {
		await createChatResponse({
			requestId: "request-1",
			userId: "user-1",
			sessionId: "conversation-1",
			message: textMessage("user-1", "user", "hello"),
		});

		state.saveChatError = new SessionSaveConflictError("conversation-1");
		const onFinish = getLastStreamInput().onFinish;
		expect(isOnFinish(onFinish)).toBe(true);
		if (!isOnFinish(onFinish)) {
			throw new Error("Expected onFinish to be exposed");
		}

		await expect(
			onFinish({
				messages: [
					textMessage("previous-user", "user", "previous"),
					textMessage("user-1", "user", "hello"),
					textMessage("assistant-1", "assistant", "hi"),
				],
			}),
		).resolves.toBeUndefined();

		expect(state.closeCalls).toBe(1);
	});

	test("should close MCP tools and return a generic error message when the stream errors", async () => {
		await createChatResponse({
			requestId: "request-1",
			userId: "user-1",
			sessionId: "conversation-1",
			message: textMessage("user-1", "user", "hello"),
		});

		const onError = getLastStreamInput().onError;
		expect(isOnError(onError)).toBe(true);
		if (!isOnError(onError)) {
			throw new Error("Expected onError to be exposed");
		}

		expect(onError()).toBe(
			"Something went wrong while generating the response.",
		);
		await Promise.resolve();
		expect(state.closeCalls).toBe(1);
	});
});
