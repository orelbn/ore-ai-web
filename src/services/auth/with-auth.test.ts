import { afterEach, describe, expect, test, vi } from "vitest";

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("./index", () => ({ auth: mockAuth }));

import { auth } from "./index";
import { withAuth } from "./with-auth";

afterEach(() => {
  vi.restoreAllMocks();
  mockAuth.api.getSession.mockReset();
});

describe(withAuth, () => {
  test("returns 401 when there is no authenticated user", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue(null);

    const authedHandler = withAuth(async () => new Response("ok"));
    const response = await authedHandler(new Request("https://example.com/api/chat"));

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe("Session access required.");
  });

  test("calls the wrapped handler with the authenticated user id", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: { id: "user-1" },
    } as Awaited<ReturnType<typeof auth.api.getSession>>);

    const handle = vi.fn(async (_request: Request, userId: string) => new Response(userId));
    const authedHandler = withAuth(handle);
    const request = new Request("https://example.com/api/chat");
    const response = await authedHandler(request);

    expect(handle).toHaveBeenCalledWith(request, "user-1");
    await expect(response.text()).resolves.toBe("user-1");
  });

  test("passes through extra bound arguments to the wrapped handler", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: { id: "user-1" },
    } as Awaited<ReturnType<typeof auth.api.getSession>>);

    const handle = vi.fn(
      async (_request: Request, userId: string, requestId: string) =>
        new Response(`${userId}:${requestId}`),
    );
    const authedHandler = withAuth(handle);
    const request = new Request("https://example.com/api/chat");
    const response = await authedHandler(request, "request-1");

    expect(handle).toHaveBeenCalledWith(request, "user-1", "request-1");
    await expect(response.text()).resolves.toBe("user-1:request-1");
  });
});
