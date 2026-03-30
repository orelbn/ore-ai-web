export type Handler<TArgs extends unknown[] = []> = (
  request: Request,
  ...args: TArgs
) => Promise<Response>;

export type AuthenticatedHandler<TArgs extends unknown[] = []> = (
  request: Request,
  userId: string,
  ...args: TArgs
) => Promise<Response>;
