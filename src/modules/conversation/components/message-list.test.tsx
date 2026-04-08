// @vitest-environment happy-dom

import { act } from "react";
import { createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { SessionMessage } from "@/modules/chat";
import { MessageList } from "./message-list";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("MessageList", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("renders assistant and user rows and shows the typing cue on the last streaming assistant message", async () => {
    const messages = [
      buildMessage({
        id: "user-1",
        role: "user",
        text: "Hey there",
        createdAt: new Date("2026-04-06T11:30:00.000Z"),
      }),
      buildMessage({
        id: "assistant-1",
        role: "assistant",
        text: "Working on it",
        createdAt: new Date("2026-04-06T11:31:00.000Z"),
      }),
      buildMessage({
        id: "assistant-2",
        role: "assistant",
        text: "Almost done",
        createdAt: new Date("2026-04-06T11:32:00.000Z"),
      }),
    ];

    await act(async () => {
      root.render(
        <MessageList
          bottomAnchorRef={createRef<HTMLDivElement>()}
          messages={messages}
          status="streaming"
        />,
      );
    });

    const rows = Array.from(container.querySelectorAll<HTMLElement>("[data-sender]"));

    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.dataset.sender)).toEqual(["user", "assistant", "assistant"]);
    expect(container.textContent).toContain("Hey there");
    expect(container.textContent).toContain("Almost done");
    expect(container.textContent).toContain("...");
  });
});

function buildMessage({
  id,
  role,
  text,
  createdAt,
}: {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: Date;
}) {
  return {
    id,
    role,
    createdAt,
    parts: [{ type: "text", text }],
  } satisfies SessionMessage & { createdAt: Date };
}
