import { describe, expect, test, vi } from "vite-plus/test";
import { withSizeLimit } from "./with-size-limit";

describe("withSizeLimit", () => {
  test("returns 413 when content-length exceeds the configured maximum", async () => {
    const handler = vi.fn(async () => new Response("ok"));
    const limitedHandler = withSizeLimit(handler, 10, "Audio upload is too large.");

    const response = await limitedHandler(
      new Request("https://example.com/api/transcribe", {
        headers: {
          "content-length": "11",
        },
      }),
      "user-1",
    );

    expect(response.status).toBe(413);
    expect(handler).not.toHaveBeenCalled();
    await expect(response.text()).resolves.toBe("Audio upload is too large.");
  });

  test("passes through requests without content-length", async () => {
    const handler = vi.fn(async () => new Response("ok"));
    const limitedHandler = withSizeLimit(handler, 10);
    const request = new Request("https://example.com/api/transcribe");

    const response = await limitedHandler(request, "user-1");

    expect(handler).toHaveBeenCalledWith(request, "user-1");
    expect(response.status).toBe(200);
  });
});
