import { Buffer } from "node:buffer";
import { env } from "cloudflare:workers";
import { TRANSCRIPTION_MODEL } from "../constants";
import type { TranscriptionResult } from "../types";

export async function transcribeAudioFile(audioFile: File): Promise<TranscriptionResult> {
  const audioBuffer = await audioFile.arrayBuffer();
  const transcript = await env.AI.run(TRANSCRIPTION_MODEL, {
    audio: Buffer.from(audioBuffer).toString("base64"),
    task: "transcribe",
    vad_filter: true,
  } satisfies Ai_Cf_Openai_Whisper_Large_V3_Turbo_Input);

  return {
    text: transcript.text.trim(),
  };
}
