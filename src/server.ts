import { createServerEntry } from "@tanstack/react-start/server-entry";
import {
	createStartHandler,
	defaultStreamHandler,
	defineHandlerCallback,
} from "@tanstack/react-start/server";
import {
	buildContentSecurityPolicy,
	generateCspNonce,
} from "@/lib/security/csp";

const handler = defineHandlerCallback((ctx) => {
	const nonce = generateCspNonce();

	ctx.router.update({
		ssr: { nonce },
	});

	ctx.responseHeaders.set(
		"Content-Security-Policy",
		buildContentSecurityPolicy(nonce),
	);

	return defaultStreamHandler(ctx);
});

const fetch = createStartHandler(handler);

export default createServerEntry({
	fetch,
});
