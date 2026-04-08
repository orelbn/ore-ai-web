import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { TRANSCRIPTION_MODEL } from "../constants";
import { transcribeAudioFile } from "./transcribe-audio";

const state = vi.hoisted(() => ({
  aiRun: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({
  env: {
    AI: {
      run: state.aiRun,
    },
  },
}));

describe("transcribeAudioFile", () => {
  beforeEach(() => {
    state.aiRun.mockReset();
  });

  test("transcribes the uploaded file with Workers AI", async () => {
    state.aiRun.mockResolvedValue({
      text: "hello there",
    });

    const audioFile = new File([new Uint8Array(1024 * 1024 + 12)], "voice.webm", {
      type: "audio/webm",
    });

    const result = await transcribeAudioFile(audioFile);

    expect(state.aiRun).toHaveBeenCalledTimes(1);
    expect(state.aiRun).toHaveBeenCalledWith(
      TRANSCRIPTION_MODEL,
      expect.objectContaining({
        audio: expect.any(String),
        task: "transcribe",
        vad_filter: true,
      }),
    );
    expect(result).toEqual({
      text: "hello there",
    });
  });
});
