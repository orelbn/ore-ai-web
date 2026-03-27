import type { InferAgentUIMessage } from "ai";
import type { createOreAgent } from "./logic/ore-agent";

export type OreAgentUIMessage = InferAgentUIMessage<ReturnType<typeof createOreAgent>>;
