export function BadRequest(message = "Bad Request") {
	return new Response(message, {
		status: 400,
	});
}

export function Unauthorized(message = "Unauthorized") {
	return new Response(message, {
		status: 401,
	});
}

export function Forbidden(message = "Forbidden") {
	return new Response(message, {
		status: 403,
	});
}

export function NotFound(message = "Not Found") {
	return new Response(message, {
		status: 404,
	});
}

export function PayloadTooLarge(message = "Payload Too Large") {
	return new Response(message, {
		status: 413,
	});
}

export function TooManyRequests(message = "Too many requests") {
	return new Response(message, {
		status: 429,
	});
}

export function InternalServerError(message = "Internal Server Error") {
	return new Response(message, {
		status: 500,
	});
}
