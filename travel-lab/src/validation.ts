import { expectedFareAnalysis } from "./exasol.js";
import { MAIN_PROMPT, type RunTrace } from "./types.js";
/** Validate only the known conference prompt. Other natural-language prompts retain their own meaning. */
export function mainResultError(trace: RunTrace): string | undefined {
  if (trace.status !== "complete" || trace.prompt.trim() !== MAIN_PROMPT) return;
  const expected = expectedFareAnalysis();
  const answer = trace.answer as {
    cheapestMonth?: string;
    airlines?: { airlineCode?: string; fare?: number; checkedKg?: number }[];
  };
  if (answer?.cheapestMonth !== expected.cheapestMonth)
    return `Result validation failed: expected the cheapest month ${expected.cheapestMonth}. The model's answer has been retained for inspection; no recording was saved.`;
  const got = (answer.airlines || []).map((airline) => [
    airline.airlineCode,
    airline.fare,
    airline.checkedKg,
  ]);
  const want = expected.airlines.map((airline) => [
    airline.airlineCode,
    airline.fare,
    airline.checkedKg,
  ]);
  if (JSON.stringify(got) !== JSON.stringify(want))
    return `Result validation failed: airline comparison does not match the Exasol fare query. No recording was saved.`;
}
