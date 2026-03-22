import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { loadIndexRouteData } from "./-index.loader";
import { IndexPage } from "./-index.page";

const getSessionEntryConfig = createServerFn({
	method: "GET",
}).handler(async () => loadIndexRouteData(getRequest().headers));

export const Route = createFileRoute("/")({
	loader: () => getSessionEntryConfig(),
	component: HomeRoute,
});

function HomeRoute() {
	return <IndexPage {...Route.useLoaderData()} />;
}
