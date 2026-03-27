import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [anonymousClient()],
});

export const { useSession, signIn } = authClient;
