import { withSizeLimit } from "@/lib/http/with-size-limit";
import { TRANSCRIPTION_MAX_AUDIO_BYTES } from "@/modules/transcription";
import { postHandler } from "@/modules/transcription/api/handlers";
import { withRateLimit } from "@/services/cloudflare";
import { withAuth } from "@/services/auth";
import { createFileRoute } from "@tanstack/react-router";

export const maxDuration = 30;

let post = withSizeLimit(postHandler, TRANSCRIPTION_MAX_AUDIO_BYTES, "Audio upload is too large.");
post = withRateLimit(post, "transcription", ["user", "ip"]);
const postWithAuth = withAuth(post);

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => postWithAuth(request),
    },
  },
});
