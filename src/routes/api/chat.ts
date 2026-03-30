import { getHandler, postHandler } from "@/modules/chat/server";
import { withRateLimit } from "@/services/cloudflare";
import { withAuth } from "@/services/auth";
import { createFileRoute } from "@tanstack/react-router";

export const maxDuration = 30;
const post = withAuth(withRateLimit(postHandler, ["user", "ip"]));

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      GET: ({ request }) => getHandler(request),
      POST: ({ request }) => post(request),
    },
  },
});
