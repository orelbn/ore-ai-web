export type LogRuntimeMode = "development" | "production";

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]"
  );
}

export function resolveLogRuntimeMode(options?: {
  request?: Request;
  mode?: LogRuntimeMode;
}): LogRuntimeMode {
  if (options?.mode) {
    return options.mode;
  }

  const nodeEnv = globalThis.process?.env?.NODE_ENV;
  if (nodeEnv === "development" || nodeEnv === "test" || nodeEnv === "local") {
    return "development";
  }
  if (nodeEnv === "production") {
    return "production";
  }

  if (options?.request) {
    const { hostname } = new URL(options.request.url);
    return isLocalHostname(hostname) ? "development" : "production";
  }

  return "production";
}

function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return null;
}

function inferErrorCode(error: unknown): string {
  if (error instanceof DOMException) {
    return error.name || "dom_exception";
  }
  if (error instanceof TypeError) {
    return "type_error";
  }
  if (error instanceof Error) {
    if (/429|rate limit/i.test(error.message)) {
      return "rate_limited";
    }
    if (error.name) {
      return error.name;
    }
    return "error";
  }
  if (typeof error === "string") {
    return "thrown_string";
  }
  return "unknown";
}

function inferErrorClass(error: unknown): string {
  if (error instanceof Error) {
    return error.name || "Error";
  }
  if (typeof error === "string") {
    return "String";
  }
  if (typeof error === "object" && error !== null) {
    return "NonErrorObject";
  }
  return "Unknown";
}

export function classifyErrorForLogging(
  error: unknown,
  options?: { mode?: LogRuntimeMode; request?: Request },
) {
  const mode = resolveLogRuntimeMode(options);
  const details = {
    errorCode: inferErrorCode(error),
    errorClass: inferErrorClass(error),
  };
  const errorMessage = getErrorMessage(error);

  return mode === "development" && errorMessage
    ? {
        ...details,
        errorMessage,
      }
    : details;
}
