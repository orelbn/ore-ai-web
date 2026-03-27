import { z } from "zod";

export const chatRequestSchema = z.object({
  sessionId: z.string().trim().min(1),
  messages: z.array(z.unknown()).min(1),
});

export const chatSchema = z.object({
  sessionId: z.string().trim().min(1),
  messages: z.unknown(),
});
