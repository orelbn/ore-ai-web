import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { IndexPage } from "./-index.page";

const getSessionEntryConfig = createServerFn({
  method: "GET",
}).handler(async () => ({
  turnstileSiteKey: env.TURNSTILE_SITE_KEY.trim(),
}));

export const Route = createFileRoute("/")({
  component: IndexRouteComponent,
  loader: async () => getSessionEntryConfig(),
});

function IndexRouteComponent() {
  return <IndexPage {...Route.useLoaderData()} />;
}
