import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { redact } from "./redact.js";
import { runAgent } from "./runner.js";
import { MAIN_PROMPT } from "./types.js";
import { saveRecording } from "./agent.js";
import { expectedFareAnalysis } from "./exasol.js";
config({
  path: fileURLToPath(new URL("../../.env.local", import.meta.url)),
  override: true,
});
if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)
  throw new Error(
    "Set OPENAI_API_KEY and OPENAI_MODEL in .env.local before recording.",
  );
const traces = await Promise.all(
  (["traditional", "code"] as const).map((mode) =>
    runAgent(mode, MAIN_PROMPT, 10, (e) =>
      console.log(`${mode}: ${e.type} ${e.name}`),
    ),
  ),
);
const debugDir=new URL("../.debug/",import.meta.url);
await mkdir(debugDir,{recursive:true});
await writeFile(new URL("last-attempt.json",debugDir),JSON.stringify(redact(traces),null,2));
for (const trace of traces) {
  if (trace.status !== "complete") continue;
  const answer = trace.answer as {
    cheapestMonth?: string;
    airlines?: { airlineCode?: string; fare?: number; checkedKg?: number }[];
  };
  const expected = expectedFareAnalysis();
  const got = (answer?.airlines || []).map((airline) => [
    airline.airlineCode,
    airline.fare,
    airline.checkedKg,
  ]);
  const want = expected.airlines.map((airline) => [
    airline.airlineCode,
    airline.fare,
    airline.checkedKg,
  ]);
  if (
    answer?.cheapestMonth !== expected.cheapestMonth ||
    JSON.stringify(got) !== JSON.stringify(want)
  ) {
    throw new Error(
      `${trace.mode} returned an unexpected fare analysis: ${JSON.stringify(answer)}. Expected ${expected.cheapestMonth}. No verified recording was saved.`,
    );
  }
}
const id = await saveRecording(traces);
if (!id) {
  console.error(traces.map((t) => ({ mode: t.mode, error: t.error })));
  process.exitCode = 1;
} else console.log(`Genuine recording saved: ${id}`);
