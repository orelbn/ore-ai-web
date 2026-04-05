import { PayloadTooLarge } from "./response";
import type { AuthenticatedHandler } from "@/types";

export function withSizeLimit<TArgs extends unknown[]>(
  handler: AuthenticatedHandler<TArgs>,
  maxBytes: number,
  message = "Request body is too large.",
): AuthenticatedHandler<TArgs> {
  return async (request, userId, ...args) => {
    const contentLengthHeader = request.headers.get("content-length");
    if (contentLengthHeader !== null) {
      const contentLength = Number.parseInt(contentLengthHeader, 10);
      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        logRequestRejection("payload_too_large", {
          contentLength,
          maxBytes,
          userId,
        });
        return PayloadTooLarge(message);
      }
    }

    return handler(request, userId, ...args);
  };
}

function logRequestRejection(reason: string, details: Record<string, unknown>) {
  console.warn(
    JSON.stringify({
      scope: "request_guard",
      level: "warn",
      reason,
      ...details,
    }),
  );
}
