import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/services/auth/schema";

export function getDatabase() {
  return drizzle(env.DB, { schema });
}
