export type Mode = "traditional" | "code";
export interface Metrics {
  exposedTools: number;
  catalogSize: number;
  initialDefinitionTokens: number;
  initialDefinitionBytes: number;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  modelRequests: number;
  toolCalls: number;
  intermediateBytes: number;
  latencyMs: number;
  costUSD: number | null;
  usageSource: "provider" | "estimated" | "mixed";
}
export interface TraceEvent {
  id: string;
  runId: string;
  mode: Mode;
  type: string;
  name: string;
  timestamp: string;
  durationMs?: number;
  payload?: unknown;
  metrics?: Metrics;
}
export interface RunTrace {
  version: 1;
  runId: string;
  mode: Mode;
  prompt: string;
  catalogSize: number;
  model: string;
  dataset: string;
  recordedAt: string;
  status: "complete" | "error";
  events: TraceEvent[];
  metrics: Metrics;
  answer?: unknown;
  error?: string;
}
export const MAIN_PROMPT =
  "Analyze historical flight prices over the last 12 months, identify the cheapest month to travel from Bengaluru to Sydney, and compare airlines offering at least 20 kg of baggage.";
