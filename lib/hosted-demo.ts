import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Mode, RunTrace } from "../travel-lab/src/types";

interface Recording {
  id: string;
  recordedAt: string;
  prompt: string;
  catalogSize: number;
  model: string;
  traces: RunTrace[];
}
const sourceFiles = [
  "travel-lab/src/app.module.ts",
  "travel-lab/src/travel.tools.ts",
  "travel-lab/src/travel.service.ts",
  "travel-lab/src/exasol.ts",
  "travel-lab/src/dataset.ts",
  "travel-lab/src/server.ts",
  "travel-lab/src/mcp-client.ts",
  "travel-lab/src/runner.ts",
  "travel-lab/package.json",
];
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function sanitize(value: unknown): unknown {
  if (typeof value === "string") {
    let text = value;
    for (const secret of [process.env.OPENAI_API_KEY, process.env.DEMO_AGENT_TOKEN])
      if (secret) text = text.split(secret).join("[REDACTED]");
    return text.replace(/Bearer\s+[\w.\-]+/gi, "Bearer [REDACTED]")
      .replace(/(?:gsk_|sk-)[A-Za-z0-9_-]{12,}/g, "[REDACTED]");
  }
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      /authorization|cookie|api.?key|password|secret|credential|token$/i.test(key) && !key.toLowerCase().includes("tokens")
        ? "[REDACTED]" : sanitize(item),
    ]));
  return value;
}
async function recordings(): Promise<Recording[]> {
  const directory = join(process.cwd(), "travel-lab", "recordings");
  const names = await readdir(directory).catch(() => [] as string[]);
  const results = await Promise.all(names.filter((name) => name.endsWith(".json") && uuid.test(name.slice(0, -5))).map(async (name) => {
    try {
      const record = sanitize(JSON.parse(await readFile(join(directory, name), "utf8"))) as Recording;
      if (!uuid.test(record.id) || !Array.isArray(record.traces)) return null;
      if (!["traditional", "code"].every((mode) => record.traces.some((trace) => trace.mode === mode && trace.status === "complete"))) return null;
      return record;
    } catch { return null; }
  }));
  return results.filter((record): record is Recording => !!record).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}
function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "cache-control": "no-store" } });
}
export async function hostedDemo(request: Request, endpoint: string): Promise<Response> {
  if (endpoint === "status" && request.method === "GET") {
    const saved = await recordings();
    const dashboard = process.env.GRAFANA_PUBLIC_URL || "";
    let grafanaReady = false;
    if (dashboard.startsWith("https://")) {
      grafanaReady = await fetch(new URL("/api/health", dashboard), { signal: AbortSignal.timeout(4000), cache: "no-store" })
        .then(async (response) => response.ok && (await response.json()).database === "ok")
        .catch(() => false);
    }
    return json({
      ready: true, executionMode: "recorded", hosting: "vercel",
      providerConfigured: false, model: saved[0]?.model || null,
      sdkVersion: "1.1.3", dataset: "travel-fixtures-2026-11-v1", busy: false,
      grafana: { ready: grafanaReady, url: dashboard, hosted: true },
      recordings: saved.map(({ traces, ...record }) => ({ ...record, modes: traces.map((trace) => trace.mode) })),
    });
  }
  if (endpoint === "sources" && request.method === "GET") {
    return json({
      files: await Promise.all(sourceFiles.map(async (path) => ({ path, code: await readFile(join(process.cwd(), path), "utf8") }))),
      commands: {
        scaffold: "npx @nitrostack/cli@1.1.3 init travel-example --preset code-mode --skip-install",
        build: "npm run build:lab", start: "npm run demo",
        traditional: "claude mcp add --transport stdio --env TRAVEL_MODE=traditional --env TRAVEL_CATALOG_SIZE=10 travel-traditional -- node travel-lab/dist/server.js",
        code: "claude mcp add --transport stdio --env TRAVEL_MODE=code --env TRAVEL_CATALOG_SIZE=10 travel-code -- node travel-lab/dist/server.js",
        inspect: "claude mcp list", record: "npm run record:demo",
      },
    });
  }
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  if (endpoint !== "replay") return json({ error: "This deployment plays genuine saved recordings. Live execution is available in the local lab." }, 409);
  let input: { id?: unknown; mode?: unknown };
  try { input = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!input || typeof input !== "object" || typeof input.id !== "string" || !uuid.test(input.id)) return json({ error: "Choose a genuine recording" }, 400);
  if (input.mode !== undefined && !["traditional", "code", "both"].includes(String(input.mode))) return json({ error: "Choose traditional, code, or both for replay." }, 400);
  const record = (await recordings()).find((item) => item.id === input.id);
  if (!record) return json({ error: "Recording not found" }, 404);
  const modes: Mode[] = input.mode === "traditional" ? ["traditional"] : input.mode === "code" ? ["code"] : ["traditional", "code"];
  const traces = record.traces.filter((trace) => modes.includes(trace.mode));
  const events = traces.flatMap((trace) => trace.events).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  let cancelled = false;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (value: unknown) => { if (!cancelled && !request.signal.aborted) controller.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`)); };
      try {
        const { traces: _traces, ...metadata } = record;
        send({ type: "session.replay", recording: metadata, notice: "REPLAY — recorded genuine execution; no live model requests." });
        let previous = events[0]?.timestamp;
        for (const event of events) {
          if (cancelled || request.signal.aborted) break;
          const delay = Math.max(0, Math.min(250, Date.parse(event.timestamp) - Date.parse(previous || event.timestamp)));
          if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
          send(event); previous = event.timestamp;
        }
        if (!cancelled && !request.signal.aborted) send({ type: "session.complete", traces, replay: true, recordingId: record.id });
        if (!cancelled) controller.close();
      } catch (error) { if (!cancelled) controller.error(error); }
    },
    cancel() { cancelled = true; },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-store, no-transform", "x-accel-buffering": "no" } });
}
