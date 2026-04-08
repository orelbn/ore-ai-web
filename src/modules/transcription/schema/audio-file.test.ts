import { describe, expect, test } from "vite-plus/test";
import { transcriptionAudioFileSchema } from "./audio-file";

describe("transcriptionAudioFileSchema", () => {
  test("parses a single supported audio file", () => {
    const audioFile = transcriptionAudioFileSchema.parse([
      new File([new Uint8Array([1, 2, 3])], "voice.webm", { type: "audio/webm" }),
    ]);

    expect(audioFile).toBeInstanceOf(File);
    expect(audioFile.type).toBe("audio/webm");
  });

  test("rejects unsupported content types", () => {
    expect(() =>
      transcriptionAudioFileSchema.parse([
        new File([new Uint8Array([1, 2, 3])], "voice.txt", { type: "text/plain" }),
      ]),
    ).toThrow("Audio upload content type is not supported.");
  });

  test("rejects multiple audio entries", () => {
    expect(() =>
      transcriptionAudioFileSchema.parse([
        new File([new Uint8Array([1])], "voice-1.webm", { type: "audio/webm" }),
        new File([new Uint8Array([2])], "voice-2.webm", { type: "audio/webm" }),
      ]),
    ).toThrow("Audio upload must include exactly one audio file.");
  });
});
