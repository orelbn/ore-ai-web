import { describe, expect, test, vi } from "vitest";
import { withSizeLimit } from "./with-size-limit";

type StreamingRequestInit = RequestInit & {
  duplex: "half";
};

describe(withSizeLimit, () => {
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

  test("can reject based on resolved body size without consuming the original request", async () => {
    const handler = vi.fn(async (request: Request) => new Response(await request.text()));
    const limitedHandler = withSizeLimit(handler, 5, "Message is too large.");

    const response = await limitedHandler(
      new Request("https://example.com/api/chat", {
        method: "POST",
        body: "123456",
      }),
      "user-1",
    );

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(413);
  });

  test("preserves the original request body when resolving size from a clone", async () => {
    const handler = vi.fn(async (request: Request) => new Response(await request.text()));
    const limitedHandler = withSizeLimit(handler, 10, "Message is too large.");
    const request = new Request("https://example.com/api/chat", {
      method: "POST",
      body: "hello",
    });

    const response = await limitedHandler(request, "user-1");

    expect(handler).toHaveBeenCalledWith(request, "user-1");
    await expect(response.text()).resolves.toBe("hello");
  });

  test("rejects streamed bodies that exceed the limit without relying on content-length", async () => {
    const handler = vi.fn(async () => new Response("ok"));
    const limitedHandler = withSizeLimit(handler, 5, "Message is too large.");
    const requestInit: StreamingRequestInit = {
      method: "POST",
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("123"));
          controller.enqueue(new TextEncoder().encode("456"));
          controller.close();
        },
      }),
      duplex: "half",
    };
    const request = new Request("https://example.com/api/chat", {
      ...requestInit,
    });

    const response = await limitedHandler(request, "user-1");

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(413);
    await expect(response.text()).resolves.toBe("Message is too large.");
  });

  test("passes through fixed-length requests under the limit without cloning the body", async () => {
    const handler = vi.fn(async (request: Request) => new Response(await request.text()));
    const limitedHandler = withSizeLimit(handler, 10, "Message is too large.");
    const requestInit: StreamingRequestInit = {
      method: "POST",
      headers: {
        "content-length": "5",
      },
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("hello"));
          controller.close();
        },
      }),
      duplex: "half",
    };
    const request = new Request("https://example.com/api/chat", {
      ...requestInit,
    });
    const cloneSpy = vi.spyOn(request, "clone");

    const response = await limitedHandler(request, "user-1");

    expect(cloneSpy).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith(request, "user-1");
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("hello");
  });

  test("ignores content-length when transfer-encoding is present", async () => {
    const handler = vi.fn(async (request: Request) => new Response(await request.text()));
    const limitedHandler = withSizeLimit(handler, 10, "Message is too large.");
    const requestInit: StreamingRequestInit = {
      method: "POST",
      headers: {
        "content-length": "999",
        "transfer-encoding": "chunked",
      },
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("hello"));
          controller.close();
        },
      }),
      duplex: "half",
    };
    const request = new Request("https://example.com/api/chat", {
      ...requestInit,
    });

    const response = await limitedHandler(request, "user-1");

    expect(handler).toHaveBeenCalledWith(request, "user-1");
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("hello");
  });
});
