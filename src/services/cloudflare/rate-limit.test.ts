import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { getClientIpFromRequest } from "./client-ip";
import { withRateLimit } from "./rate-limit";

const {
  env,
  chatUserQuotaLimit,
  chatIpQuotaLimit,
  transcriptionUserQuotaLimit,
  transcriptionIpQuotaLimit,
} = vi.hoisted(() => {
  const chatUserQuotaLimit = vi.fn();
  const chatIpQuotaLimit = vi.fn();
  const transcriptionUserQuotaLimit = vi.fn();
  const transcriptionIpQuotaLimit = vi.fn();

  return {
    chatUserQuotaLimit,
    chatIpQuotaLimit,
    transcriptionUserQuotaLimit,
    transcriptionIpQuotaLimit,
    env: {
      BETTER_AUTH_SECRET: "test-better-auth-secret",
      CHAT_USER_QUOTA: {
        limit: chatUserQuotaLimit,
      },
      CHAT_IP_QUOTA: {
        limit: chatIpQuotaLimit,
      },
      TRANSCRIPTION_USER_QUOTA: {
        limit: transcriptionUserQuotaLimit,
      },
      TRANSCRIPTION_IP_QUOTA: {
        limit: transcriptionIpQuotaLimit,
      },
    },
  };
});

vi.mock("cloudflare:workers", () => ({ env }));

afterEach(() => {
  vi.restoreAllMocks();
  chatUserQuotaLimit.mockReset();
  chatIpQuotaLimit.mockReset();
  transcriptionUserQuotaLimit.mockReset();
  transcriptionIpQuotaLimit.mockReset();
});

describe("cloudflare rate limit", () => {
  test("extracts the client IP from cf-connecting-ip", () => {
    const request = new Request("https://example.com/api/chat", {
      headers: { "cf-connecting-ip": "203.0.113.7" },
    });

    expect(getClientIpFromRequest(request)).toBe("203.0.113.7");
  });

  test("falls back to x-forwarded-for when cf-connecting-ip is missing", () => {
    const request = new Request("https://example.com/api/chat", {
      headers: { "x-forwarded-for": "203.0.113.7, 198.51.100.8" },
    });

    expect(getClientIpFromRequest(request)).toBe("203.0.113.7");
  });

  test("returns a handler descriptor that enforces both limits before continuing", async () => {
    chatUserQuotaLimit.mockResolvedValue({ success: true });
    chatIpQuotaLimit.mockResolvedValue({ success: true });

    const request = new Request("https://example.com/api/chat", {
      headers: { "cf-connecting-ip": "203.0.113.7" },
    });
    const handler = vi.fn(async (_request: Request, userId: string) => {
      return new Response(userId);
    });

    const rateLimitedHandler = withRateLimit(handler, "chat", ["user", "ip"]);
    const response = await rateLimitedHandler(request, "user-1");

    expect(chatUserQuotaLimit).toHaveBeenCalledWith({ key: "user:user-1" });
    expect(chatIpQuotaLimit).toHaveBeenCalledWith({
      key: expect.stringMatching(/^ip:[0-9a-f]{32}$/),
    });
    expect(handler).toHaveBeenCalledWith(request, "user-1");
    await expect(response.text()).resolves.toBe("user-1");
  });

  test("passes through extra bound arguments to the wrapped handler", async () => {
    chatUserQuotaLimit.mockResolvedValue({ success: true });
    chatIpQuotaLimit.mockResolvedValue({ success: true });

    const request = new Request("https://example.com/api/chat");
    const handler = vi.fn(
      async (_request: Request, userId: string, requestId: string) =>
        new Response(`${userId}:${requestId}`),
    );

    const rateLimitedHandler = withRateLimit(handler, "chat", ["user", "ip"]);
    const response = await rateLimitedHandler(request, "user-1", "request-1");

    expect(handler).toHaveBeenCalledWith(request, "user-1", "request-1");
    await expect(response.text()).resolves.toBe("user-1:request-1");
  });

  test("returns 429 when the user limit is exceeded", async () => {
    chatUserQuotaLimit.mockResolvedValue({
      success: false,
    });
    const handler = vi.fn(async () => new Response("ok"));

    const rateLimitedHandler = withRateLimit(
      handler as (request: Request, userId: string) => Promise<Response>,
      "chat",
      ["user", "ip"],
    );
    const response = await rateLimitedHandler(
      new Request("https://example.com/api/chat"),
      "user-1",
    );

    expect(response.status).toBe(429);
    expect(chatIpQuotaLimit).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  test("can enforce the transcription scope independently from chat", async () => {
    transcriptionUserQuotaLimit.mockResolvedValue({ success: true });
    transcriptionIpQuotaLimit.mockResolvedValue({ success: true });
    const handler = vi.fn(async () => new Response("ok"));

    const rateLimitedHandler = withRateLimit(handler, "transcription", ["user", "ip"]);
    const response = await rateLimitedHandler(
      new Request("https://example.com/api/transcribe", {
        headers: { "cf-connecting-ip": "203.0.113.7" },
      }),
      "user-1",
    );

    expect(transcriptionUserQuotaLimit).toHaveBeenCalledWith({ key: "user:user-1" });
    expect(transcriptionIpQuotaLimit).toHaveBeenCalledWith({
      key: expect.stringMatching(/^ip:[0-9a-f]{32}$/),
    });
    expect(chatUserQuotaLimit).not.toHaveBeenCalled();
    expect(chatIpQuotaLimit).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
});
