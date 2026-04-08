import { PayloadTooLarge } from "./response";
import type { AuthenticatedHandler } from "@/types";

export function withSizeLimit<TArgs extends unknown[]>(
  handler: AuthenticatedHandler<TArgs>,
  maxBytes: number,
  message = "Request body is too large.",
): AuthenticatedHandler<TArgs> {
  return async (request, userId, ...args) => {
    const contentLength = resolveContentLength(request);
    if (contentLength !== null) {
      if (contentLength > maxBytes) return PayloadTooLarge(message);
    } else if (await bodyExceedsLimit(request, maxBytes)) {
      return PayloadTooLarge(message);
    }

    return handler(request, userId, ...args);
  };
}

function resolveContentLength(request: Request) {
  if (request.headers.has("transfer-encoding")) return null;

  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader === null) return null;

  const contentLength = Number.parseInt(contentLengthHeader, 10);
  return Number.isFinite(contentLength) ? contentLength : null;
}

async function bodyExceedsLimit(request: Request, maxBytes: number) {
  const clonedBody = request.clone().body;
  if (!clonedBody) return false;

  const reader = clonedBody.getReader();
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return false;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) return true;
    }
  } finally {
    reader.releaseLock();
  }
}
