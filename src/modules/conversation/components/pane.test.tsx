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

const voiceInputSpies = vi.hoisted(() => ({
  errorMessage: null as string | null,
  onVoiceClick: vi.fn(),
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

vi.mock("../client/use-voice-input", () => ({
  useVoiceInput: () => ({
    errorMessage: voiceInputSpies.errorMessage,
    isRecording: false,
    isTranscribing: false,
    onVoiceClick: voiceInputSpies.onVoiceClick,
  }),
}));

import { Pane } from "./pane";

describe("Pane", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    voiceInputSpies.errorMessage = null;
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

  it("routes voice button clicks through the voice input hook", async () => {
    await renderPane({
      messages: [],
      sessionId: "session-1",
    });

    await clickButton("Start voice recording");

    expect(voiceInputSpies.onVoiceClick).toHaveBeenCalledTimes(1);
  });

  it("renders voice errors inside the composer", async () => {
    voiceInputSpies.errorMessage = "No speech was detected. Please try again.";

    await renderPane({
      messages: [],
      sessionId: "session-1",
    });

    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("No speech was detected. Please try again.");
  });

  async function renderPane({
    messages,
    sessionId,
  }: {
    messages: SessionMessage[];
    sessionId: string;
  }) {
    await act(async () => {
      root.render(<Pane messages={messages} sessionId={sessionId} />);
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
