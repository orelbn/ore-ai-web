import { Unauthorized } from "@/lib/http/response";
import { auth } from "./index";

export function withAuth<TArgs extends unknown[]>(
	handler: (request: Request, userId: string, ...args: TArgs) => Promise<Response>,
) {
	return async (request: Request, ...args: TArgs) => {
		const session = await auth.api.getSession({ headers: request.headers });
		const userId =
			typeof session?.user?.id === "string" ? session.user.id : null;

		if (!userId) return Unauthorized("Session access required.");

		return await handler(request, userId, ...args);
	};
}
