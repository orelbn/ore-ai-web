import type { ToolSet } from "ai";
import { resolveMcpToolsFromServers } from "./tooling";
import type { McpServiceBinding } from "./types";

export interface ResolveOreAiMcpToolsInput {
  mcpServiceBinding: McpServiceBinding;
}

export interface ResolvedOreAiMcpTools {
  tools: ToolSet;
  close: () => Promise<void>;
}

export type OreAiMcpServiceBinding = McpServiceBinding;

export async function resolveOreAiMcpTools({
  mcpServiceBinding,
}: ResolveOreAiMcpToolsInput): Promise<ResolvedOreAiMcpTools> {
  return resolveMcpToolsFromServers({
    servers: [
      {
        serverName: "ore_ai_mcp",
        serviceBinding: mcpServiceBinding,
      },
    ],
  });
}
