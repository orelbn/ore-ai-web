import { z } from "zod";
import { TRANSCRIPTION_ALLOWED_CONTENT_TYPES } from "../constants";

const allowedContentTypes = new Set<string>(TRANSCRIPTION_ALLOWED_CONTENT_TYPES);

export const transcriptionAudioFileSchema = z
  .array(z.unknown())
  .length(1, {
    message: "Audio upload must include exactly one audio file.",
  })
  .transform(([audioFile]) => audioFile)
  .pipe(
    z
      .file({ error: "Audio upload must be a file." })
      .min(1, { error: "Audio upload cannot be empty." })
      .refine((audioFile) => allowedContentTypes.has(audioFile.type.toLowerCase()), {
        message: "Audio upload content type is not supported.",
      }),
  );
