export type Success<T> = {
  data: T;
  error: null;
};

export type Failure<E> = {
  data: null;
  error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function toSuccess<T>(data: T): Result<T> {
  return { data, error: null };
}

function toFailure<T>(error: unknown): Result<T> {
  return { data: null, error: normalizeError(error) };
}

export function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return toSuccess(fn());
  } catch (error) {
    return toFailure(error);
  }
}

export async function tryCatchAsync<T>(promise: PromiseLike<T>): Promise<Result<T>> {
  try {
    return toSuccess(await promise);
  } catch (error) {
    return toFailure(error);
  }
}
