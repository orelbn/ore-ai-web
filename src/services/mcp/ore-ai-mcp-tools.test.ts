import type { ToolSet } from "ai";
import { afterAll, beforeEach, describe, expect, vi, test } from "vitest";
import type { McpServiceBinding } from "./types";
import { resolveOreAiMcpTools } from "./ore-ai-mcp-tools";

const state: {
  calls: {
    servers: Array<{
      serverName: string;
      serviceBinding?: McpServiceBinding;
    }>;
  }[];
  resolvedTools: ToolSet;
  closeCalls: number;
} = {
  calls: [],
  closeCalls: 0,
  resolvedTools: {
    "ore.alpha": { execute: async () => ({ ok: true }) },
  } as unknown as ToolSet,
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

describe(resolveOreAiMcpTools, () => {
  test("forwards the MCP service binding", async () => {
    const binding: McpServiceBinding = {
      fetch: async () => new Response("ok"),
    };
    const resolved = await resolveOreAiMcpTools({
      mcpServiceBinding: binding,
    });

    expect(state.calls).toHaveLength(1);
    expect(state.calls[0]).toStrictEqual({
      servers: [
        {
          serverName: "ore_ai_mcp",
          serviceBinding: binding,
        },
      ],
    });

    expect(Object.keys(resolved.tools)).toStrictEqual(["ore.alpha"]);
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
    });

    expect(Object.keys(resolved.tools).toSorted()).toStrictEqual(["ore.alpha", "ore.beta"]);
  });
});
