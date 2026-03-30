export type RateLimiter = (request: Request, userId: string) => Promise<Response | null>;
export type LimiterKey = "user" | "ip";
