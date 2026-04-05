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
        return PayloadTooLarge(message);
      }
    }

    const bodySize = await resolveBodySize(request);
    if (bodySize > maxBytes) return PayloadTooLarge(message);

    return handler(request, userId, ...args);
  };
}

async function resolveBodySize(request: Request) {
  const clonedRequest = request.clone();
  const bodyBuffer = await clonedRequest.arrayBuffer();
  return bodyBuffer.byteLength;
}
