export const TRANSCRIPTION_MODEL = "@cf/openai/whisper-large-v3-turbo";
export const TRANSCRIPTION_MAX_AUDIO_BYTES = 5 * 1024 * 1024;
export const TRANSCRIPTION_FORM_FIELD_NAME = "audio";
export const TRANSCRIPTION_ALLOWED_CONTENT_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm;codecs=opus",
  "audio/ogg;codecs=opus",
] as const;
