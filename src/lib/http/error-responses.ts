export function jsonError(status: number, message: string) {
	return Response.json({ error: message }, { status });
}

export function textError(status: number, message: string) {
	return new Response(message, {
		status,
		headers: {
			"content-type": "text/plain; charset=utf-8",
		},
	});
}
