import { afterEach, describe, expect, vi, test } from "vitest";
import { resolveChatRuntimeConfig } from "./runtime-config";

afterEach(() => {
  vi.restoreAllMocks();
});

describe(resolveChatRuntimeConfig, () => {
  test("returns empty config without prompt key", async () => {
    const result = await resolveChatRuntimeConfig({});

    expect(result).toStrictEqual({
      agentSystemPrompt: undefined,
    });
  });

  test("resolves prompt from R2 when key and bucket are valid", async () => {
    const result = await resolveChatRuntimeConfig({
      AGENT_PROMPT_KEY: "prompts/prod.txt",
      AGENT_PROMPTS: {
        get: async (key: string) =>
          key === "prompts/prod.txt" ? { text: async () => "  prompt from R2  " } : null,
      },
    });

    expect(result).toStrictEqual({
      agentSystemPrompt: "prompt from R2",
    });
  });

  test("warns and falls back when prompt storage resolution fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await resolveChatRuntimeConfig(
      {
        AGENT_PROMPT_KEY: "prompts/prod.txt",
      },
      "production",
    );

    expect(result).toStrictEqual({
      agentSystemPrompt: undefined,
    });
    expect(warn).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(warn.mock.calls[0]?.[0]));
    expect(payload.scope).toBe("chat_runtime_config");
    expect(payload.level).toBe("warn");
    expect(payload.stage).toBe("prompt_storage");
    expect(payload.errorCode).toBe("Error");
    expect(payload.errorClass).toBe("Error");
    expect(payload.errorMessage).toBeUndefined();
  });

  test("treats whitespace prompt key as unset", async () => {
    const result = await resolveChatRuntimeConfig({
      AGENT_PROMPT_KEY: "   ",
    });

    expect(result.agentSystemPrompt).toBeUndefined();
  });
});
