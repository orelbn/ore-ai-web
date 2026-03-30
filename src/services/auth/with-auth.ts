import type { AuthenticatedHandler, Handler } from "@/types";
import { Unauthorized } from "@/lib/http/response";
import { auth } from "./index";

export function withAuth<TArgs extends unknown[]>(
  handler: AuthenticatedHandler<TArgs>,
): Handler<TArgs> {
  return async (request: Request, ...args: TArgs) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = typeof session?.user?.id === "string" ? session.user.id : null;

    if (!userId) return Unauthorized("Session access required.");

    return await handler(request, userId, ...args);
  };
}
