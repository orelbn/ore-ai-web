// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { SessionMessage } from "@/modules/chat";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

const conversationSubmissionSpies = vi.hoisted(() => ({
  stop: vi.fn(),
  sendMessage: vi.fn(async () => undefined),
}));

vi.mock("@ai-sdk/react", async () => {
  const React = await import("react");

  return {
    useChat: (options: { messages: SessionMessage[] }) => {
      const [messages] = React.useState(options.messages);

      return {
        error: undefined,
        messages,
        sendMessage: conversationSubmissionSpies.sendMessage,
        status: "ready",
        stop: conversationSubmissionSpies.stop,
      };
    },
  };
});

import { ConversationPane } from "./conversation-pane";

describe("ConversationPane", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it("routes feature-card clicks through prompt submission instead of raw input state", async () => {
    await renderPane({
      messages: [],
      sessionId: "session-1",
    });

    await clickButton("Coffee Places");

    expect(conversationSubmissionSpies.sendMessage).toHaveBeenCalledWith(
      { text: "What are Orel's favorite coffee shops?" },
      {
        body: {
          sessionId: "session-1",
        },
      },
    );
  });

  it("renders the voice button as explicitly unavailable", async () => {
    await renderPane({
      messages: [],
      sessionId: "session-1",
    });

    const voiceButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Voice input coming soon"]',
    );

    expect(voiceButton).not.toBeNull();
    expect(voiceButton?.disabled).toBe(true);
    expect(voiceButton?.title).toBe("Voice input coming soon");
  });

  async function renderPane({
    messages,
    sessionId,
  }: {
    messages: SessionMessage[];
    sessionId: string;
  }) {
    await act(async () => {
      root.render(<ConversationPane messages={messages} sessionId={sessionId} />);
    });
  }

  async function clickButton(label: string) {
    const button = findButton(label);

    expect(button).toBeDefined();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }
});

function findButton(label: string) {
  return Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
    (candidate) =>
      candidate.getAttribute("aria-label") === label || candidate.textContent?.includes(label),
  );
}
