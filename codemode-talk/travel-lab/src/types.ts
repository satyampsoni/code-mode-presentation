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
  "Find flights from Bengaluru to Sydney under ₹40,000, check their baggage allowances, and return the three cheapest options with at least 20 kg of checked baggage.";
