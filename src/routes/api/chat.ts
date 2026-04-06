import { withSizeLimit } from "@/lib/http/with-size-limit";
import { CHAT_MAX_BODY_BYTES } from "@/modules/chat/constants";
import { getHandler, postHandler } from "@/modules/chat/server";
import { withRateLimit } from "@/services/cloudflare";
import { withAuth } from "@/services/auth";
import type { Handler } from "@/types";
import { createFileRoute } from "@tanstack/react-router";

export const maxDuration = 30;

let post = withSizeLimit(postHandler, CHAT_MAX_BODY_BYTES, "Message is too large.");
post = withRateLimit(post, "chat", ["user", "ip"]);
const postWithAuth: Handler = withAuth(post);

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      GET: ({ request }) => getHandler(request),
      POST: ({ request }) => postWithAuth(request),
    },
  },
});
