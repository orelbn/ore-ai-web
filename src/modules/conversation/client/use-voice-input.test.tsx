// @vitest-environment happy-dom

import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVoiceInput } from "./use-voice-input";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

class FakeMediaRecorder {
  mimeType = "audio/webm";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  state: "inactive" | "recording" = "inactive";
  #listeners = new Map<string, Array<(event?: { data: Blob }) => void>>();

  addEventListener(type: string, callback: (event?: { data: Blob }) => void) {
    const listeners = this.#listeners.get(type) ?? [];
    listeners.push(callback);
    this.#listeners.set(type, listeners);
  }

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    const dataEvent = { data: new Blob(["voice"], { type: this.mimeType }) };
    this.ondataavailable?.(dataEvent);
    for (const callback of this.#listeners.get("dataavailable") ?? []) {
      callback(dataEvent);
    }
    this.onstop?.();
    for (const callback of this.#listeners.get("stop") ?? []) {
      callback();
    }
  }
}

function HookHarness() {
  const [input, setInput] = useState("");
  const voiceInput = useVoiceInput({
    onInputChange: setInput,
  });

  return (
    <>
      <button type="button" onClick={voiceInput.onVoiceClick}>
        {voiceInput.isRecording ? "recording" : voiceInput.isTranscribing ? "transcribing" : "idle"}
      </button>
      <output data-testid="input">{input}</output>
      <output data-testid="error">{voiceInput.errorMessage ?? ""}</output>
    </>
  );
}

describe("useVoiceInput", () => {
  let container: HTMLDivElement;
  let root: Root;
  let originalFetch: typeof fetch;
  let originalMediaRecorder: typeof MediaRecorder | undefined;
  let originalMediaDevices: MediaDevices | undefined;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    const mockedFetch = Object.assign(
      async () =>
        new Response(JSON.stringify({ text: "voice transcript" }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      {
        preconnect: originalFetch.preconnect?.bind(originalFetch),
      },
    ) satisfies typeof fetch;
    globalThis.fetch = mockedFetch;

    originalMediaRecorder = globalThis.MediaRecorder;
    Object.defineProperty(globalThis, "MediaRecorder", {
      configurable: true,
      value: FakeMediaRecorder,
    });

    originalMediaDevices = navigator.mediaDevices;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn(async () => ({
          getTracks: () => [{ stop() {} }],
        })),
      },
    });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    globalThis.fetch = originalFetch;

    Object.defineProperty(globalThis, "MediaRecorder", {
      configurable: true,
      value: originalMediaRecorder,
    });

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: originalMediaDevices,
    });

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("records, transcribes, and appends the transcript to the input", async () => {
    await act(async () => {
      root.render(<HookHarness />);
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await flushAsyncWork();

    const recordingButton = container.querySelector("button");
    expect(recordingButton).not.toBeNull();

    await act(async () => {
      recordingButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await flushAsyncWork();

    expect(readOutput("input")).toBe("voice transcript");
    expect(readOutput("error")).toBe("");
  });

  it("shows a friendly error when the transcription response is invalid", async () => {
    const mockedFetch = Object.assign(
      async () =>
        new Response(JSON.stringify({ transcript: "voice transcript" }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      {
        preconnect: originalFetch.preconnect?.bind(originalFetch),
      },
    ) satisfies typeof fetch;
    globalThis.fetch = mockedFetch;

    await act(async () => {
      root.render(<HookHarness />);
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await flushAsyncWork();

    const recordingButton = container.querySelector("button");
    expect(recordingButton).not.toBeNull();

    await act(async () => {
      recordingButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await flushAsyncWork();

    expect(readOutput("input")).toBe("");
    expect(readOutput("error")).toBe("Voice input failed. Please try again.");
  });
});

async function flushAsyncWork() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function readOutput(testId: string) {
  return document.querySelector(`[data-testid="${testId}"]`)?.textContent;
}
