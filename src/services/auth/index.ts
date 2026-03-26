import { betterAuth } from "better-auth/minimal";
import { buildOreAuthOptions } from "./config";

export const auth = betterAuth(buildOreAuthOptions());
export { withAuth } from "./with-auth";
