import { InternalServerError } from "@/lib/http/response";
import { auth } from "@/services/auth";
import { loadLatestChat } from "../../logic/load-conversation";
import { validateChatPostRequest } from "./request-guards";
import { createChatResponse } from "../logic/create-chat-response";

export async function getHandler(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });
	const userId = typeof session?.user?.id === "string" ? session.user.id : null;

	return Response.json(await loadLatestChat(userId));
}

export async function postHandler(request: Request, userId: string) {
	const requestId = crypto.randomUUID();

	try {
		const chatRequest = await validateChatPostRequest(request);
		return await createChatResponse({
			requestId,
			userId,
			...chatRequest,
		});
	} catch (error) {
		if (error instanceof Response) {
			return error;
		}

		return InternalServerError("Internal server error");
	}
}
