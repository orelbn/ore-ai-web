import { z } from "zod";

export const transcriptionResponseSchema = z.object({
  text: z.string(),
});
