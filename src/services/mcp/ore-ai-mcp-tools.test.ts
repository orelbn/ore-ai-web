import type { ToolSet } from "ai";
import { afterAll, beforeEach, describe, expect, vi, test } from "vite-plus/test";
import type { McpServiceBinding } from "./types";
import { resolveOreAiMcpTools } from "./ore-ai-mcp-tools";

const state: {
  calls: Array<{
    servers: Array<{
      serverName: string;
      serverUrl: string;
      serviceBinding?: McpServiceBinding;
    }>;
  }>;
  resolvedTools: ToolSet;
  closeCalls: number;
} = {
  calls: [],
  resolvedTools: {
    "ore.alpha": { execute: async () => ({ ok: true }) },
  } as unknown as ToolSet,
  closeCalls: 0,
};

function resetState() {
  state.calls = [];
  state.resolvedTools = {
    "ore.alpha": { execute: async () => ({ ok: true }) },
  } as unknown as ToolSet;
  state.closeCalls = 0;
}

vi.mock("../mcp/tooling", () => ({
  resolveMcpToolsFromServers: async (options: {
    servers: Array<{
      serverName: string;
      serverUrl: string;
      serviceBinding?: McpServiceBinding;
    }>;
  }) => {
    state.calls.push(options);
    return {
      tools: state.resolvedTools,
      close: async () => {
        state.closeCalls += 1;
      },
    };
  },
}));

beforeEach(() => {
  resetState();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("resolveOreAiMcpTools", () => {
  test("forwards server config without custom headers", async () => {
    const binding: McpServiceBinding = {
      fetch: async () => new Response("ok"),
    };
    const resolved = await resolveOreAiMcpTools({
      mcpServiceBinding: binding,
      mcpServerUrl: "https://ore-ai-mcp/mcp",
    });

    expect(state.calls).toHaveLength(1);
    expect(state.calls[0]).toEqual({
      servers: [
        {
          serverName: "ore_ai_mcp",
          serverUrl: "https://ore-ai-mcp/mcp",
          serviceBinding: binding,
        },
      ],
    });

    expect(Object.keys(resolved.tools)).toEqual(["ore.alpha"]);
    await resolved.close();
    expect(state.closeCalls).toBe(1);
  });

  test("returns the tools object from resolver", async () => {
    state.resolvedTools = {
      "ore.alpha": { execute: async () => ({ ok: true }) },
      "ore.beta": { execute: async () => ({ ok: true }) },
    } as unknown as ToolSet;

    const resolved = await resolveOreAiMcpTools({
      mcpServiceBinding: {
        fetch: async () => new Response("ok"),
      },
      mcpServerUrl: "https://ore-ai-mcp/mcp",
    });

    expect(Object.keys(resolved.tools).sort()).toEqual(["ore.alpha", "ore.beta"]);
  });
});
