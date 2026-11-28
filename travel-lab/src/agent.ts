import { createServer } from "node:http";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { runAgent } from "./runner.js";
import { connectMcp, unpack } from "./mcp-client.js";
import { redact } from "./redact.js";
import { mainResultError } from "./validation.js";
import { refreshRecordedMetrics, publishLiveMetric } from "./observability.js";
import type { Mode, RunTrace, TraceEvent } from "./types.js";
config({
  path: fileURLToPath(new URL("../../.env.local", import.meta.url)),
  override: true,
});
const root = new URL("../../", import.meta.url),
  recordings = new URL("../recordings/", import.meta.url);
export interface Recording {
  version: 1;
  id: string;
  recordedAt: string;
  prompt: string;
  catalogSize: number;
  model: string;
  traces: RunTrace[];
}
export async function saveRecording(traces: RunTrace[]) {
  for (const trace of traces) {
    const error = mainResultError(trace);
    if (error) {
      trace.status = "error";
      trace.error = error;
    }
  }

  if (!traces.length || traces.some((t) => t.status !== "complete"))
    return null;
  const recording: Recording = {
    version: 1,
    id: randomUUID(),
    recordedAt: new Date().toISOString(),
    prompt: traces[0].prompt,
    catalogSize: traces[0].catalogSize,
    model: traces[0].model,
    traces,
  };
  await mkdir(recordings, { recursive: true });
  await writeFile(
    new URL(`${recording.id}.json`, recordings),
    JSON.stringify(redact(recording), null, 2),
  );
  await refreshRecordedMetrics();
  return recording.id;
}
async function listRecordings() {
  await mkdir(recordings, { recursive: true });
  const files = (await readdir(recordings)).filter((f) => f.endsWith(".json"));
  const rows = await Promise.all(
    files.map(async (f) => {
      try {
        const r = JSON.parse(
          await readFile(new URL(f, recordings), "utf8"),
        ) as Recording;
        return {
          id: r.id,
          recordedAt: r.recordedAt,
          prompt: r.prompt,
          catalogSize: r.catalogSize,
          model: r.model,
          modes: r.traces.map((t) => t.mode),
        };
      } catch {
        return null;
      }
    }),
  );
  return rows
    .filter(Boolean)
    .sort((a, b) => b!.recordedAt.localeCompare(a!.recordedAt));
}
async function body(req: import("node:http").IncomingMessage) {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 24000) throw new Error("Request body too large");
  }
  return JSON.parse(data || "{}");
}
const sources = [
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
let busy = false;
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  const json = (status: number, data: unknown) => {
    res.writeHead(status, {
      "content-type": "application/json",
      "cache-control": "no-store",
    });
    res.end(JSON.stringify(redact(data)));
  };
  let ownsBusy = false;
  try {
    if (
      req.headers.origin &&
      !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.origin)
    ) {
      json(403, { error: "Local demo requests only" });
      return;
    }
    if (pathname === "/status") {
      await refreshRecordedMetrics();
      const grafanaReady = await fetch("http://127.0.0.1:3300/api/health", {
        signal: AbortSignal.timeout(1200),
      })
        .then((r) => r.ok)
        .catch(() => false);
      json(200, {
        ready: true,
        providerConfigured:
          !!process.env.OPENAI_API_KEY && !!process.env.OPENAI_MODEL,
        model: process.env.OPENAI_MODEL || null,
        provider: "OpenAI-compatible Chat Completions",
        sdkVersion: "1.1.3",
        grafana: { ready: grafanaReady, url: "http://localhost:3300" },
        dataset: "travel-fixtures-2026-11-v1",
        sandbox: {
          runtime: "QuickJS WebAssembly",
          timeoutMs: 2000,
          memoryLimitMb: 64,
          maxToolCalls: 40,
        },
        recordings: await listRecordings(),
        busy,
      });
      return;
    }
    if (pathname === "/sources") {
      json(200, {
        files: await Promise.all(
          sources.map(async (path) => ({
            path,
            code: await readFile(new URL(path, root), "utf8"),
          })),
        ),
        commands: {
          scaffold:
            "npx @nitrostack/cli@1.1.3 init travel-example --preset code-mode --skip-install",
          build: "npm run build:lab",
          start: "npm run demo",
          traditional: `claude mcp add --transport stdio --env TRAVEL_MODE=traditional --env TRAVEL_CATALOG_SIZE=10 travel-traditional -- node ${fileURLToPath(new URL("travel-lab/dist/server.js", root))}`,
          code: `claude mcp add --transport stdio --env TRAVEL_MODE=code --env TRAVEL_CATALOG_SIZE=10 travel-code -- node ${fileURLToPath(new URL("travel-lab/dist/server.js", root))}`,
          inspect: "claude mcp list",
          record: "npm run record:demo",
        },
      });
      return;
    }
    if (req.method !== "POST") {
      json(405, { error: "POST required" });
      return;
    }
    if (!["/run", "/replay", "/security"].includes(pathname)) {
      json(404, { error: "Unknown endpoint" });
      return;
    }
    const input = await body(req);
    if (pathname === "/security") {
      if (busy) {
        json(409, { error: "Wait for the current run to finish" });
        return;
      }
      busy = true;
      ownsBusy = true;
      let c: Awaited<ReturnType<typeof connectMcp>> | undefined;
      const started = performance.now();
      try {
        c = await connectMcp("code", 10);
        await c.client.listTools();
        const result = await c.client.callTool(
          { name: "execute", arguments: { code: "while (true) {}" } },
          undefined,
          { timeout: 10000 },
        );
        const blocked = !!(result as { isError?: boolean }).isError;
        json(200, {
          test: "Actual QuickJS timeout",
          code: "while (true) {}",
          timeoutMs: 2000,
          blocked,
          result: unpack(result),
          durationMs: Math.round(performance.now() - started),
          lineInstrumentation: false,
        });
      } finally {
        await c?.close();
        busy = false;
      }
      return;
    }
    if (pathname === "/run" && busy) {
      json(409, {
        error: "A live run is already active. Wait or cancel it first.",
      });
      return;
    }
    const modes: Mode[] =
      input.mode === "both"
        ? ["traditional", "code"]
        : input.mode === "traditional"
          ? ["traditional"]
          : input.mode === "code"
            ? ["code"]
            : [];
    if (pathname === "/replay" && input.mode !== undefined && !modes.length) {
      json(400, { error: "Choose traditional, code, or both for replay." });
      return;
    }
    if (
      pathname === "/run" &&
      (!modes.length ||
        ![10, 100, 1000].includes(input.catalogSize) ||
        typeof input.prompt !== "string" ||
        !input.prompt.trim() ||
        input.prompt.length > 6000)
    ) {
      json(400, {
        error:
          "Choose a mode, a catalog of 10/100/1000, and a prompt (1–6,000 characters).",
      });
      return;
    }
    let recording: Recording | undefined;
    if (pathname === "/replay") {
      if (typeof input.id !== "string" || !/^[a-f0-9-]{36}$/.test(input.id)) {
        json(400, { error: "Choose a genuine recording" });
        return;
      }
      try {
        recording = JSON.parse(
          await readFile(new URL(`${input.id}.json`, recordings), "utf8"),
        );
      } catch {
        json(404, { error: "Recording not found" });
        return;
      }
    }
    if (pathname === "/run") {
      busy = true;
      ownsBusy = true;
    }
    if (
      recording &&
      !["traditional", "code"].every((mode) =>
        recording!.traces.some(
          (t) => t.mode === mode && t.status === "complete",
        ),
      )
    ) {
      json(400, {
        error:
          "Select a genuine comparison recording containing both Tool Calling and Code Mode.",
      });
      return;
    }
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    });
    res.flushHeaders();
    const controller = new AbortController();
    res.on("close", () => controller.abort());
    const send = (data: unknown) => {
      if (!res.destroyed)
        res.write(`data: ${JSON.stringify(redact(data))}\n\n`);
    };
    const heartbeat = setInterval(() => {
      if (!res.destroyed) res.write(": heartbeat\n\n");
    }, 10000);
    try {
      if (recording) {
        const replayTraces = recording.traces.filter(
          (trace) => !modes.length || modes.includes(trace.mode),
        );
        send({
          type: "session.replay",
          recording: {
            id: recording.id,
            recordedAt: recording.recordedAt,
            prompt: recording.prompt,
            catalogSize: recording.catalogSize,
            model: recording.model,
          },
          notice:
            "REPLAY — recorded genuine execution, accelerated playback; no live model requests.",
        });
        const all = replayTraces
          .flatMap((t) => t.events)
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        let previous = all[0]?.timestamp;
        for (const event of all) {
          if (controller.signal.aborted) break;
          const delay = Math.max(
            0,
            Math.min(
              250,
              new Date(event.timestamp).getTime() -
                new Date(previous || event.timestamp).getTime(),
            ),
          );
          if (delay) await new Promise((r) => setTimeout(r, delay));
          send(event);
          previous = event.timestamp;
        }
        send({
          type: "session.complete",
          traces: replayTraces,
          replay: true,
          recordingId: recording.id,
        });
      } else {
        send({
          type: "session.start",
          modes,
          prompt: input.prompt,
          catalogSize: input.catalogSize,
        });
        const traces = await Promise.all(
          modes.map((mode) =>
            runAgent(
              mode,
              input.prompt.trim(),
              input.catalogSize,
              (event) => {
                publishLiveMetric(event);
                send(event);
              },
              controller.signal,
            ),
          ),
        );
        const recordingId = await saveRecording(traces);
        send({ type: "session.complete", traces, replay: false, recordingId });
      }
    } catch (error) {
      send({ type: "session.error", error: String(error) });
    } finally {
      clearInterval(heartbeat);
      if (pathname === "/run") busy = false;
      res.end();
    }
  } catch (error) {
    if (!res.headersSent) json(500, { error: String(error) });
    else res.end();
    if (ownsBusy) busy = false;
  }
});
void refreshRecordedMetrics();
if (process.argv[1] === fileURLToPath(import.meta.url))
  server.listen(Number(process.env.DEMO_AGENT_PORT || 4100), "127.0.0.1", () =>
    console.log("Travel agent backend listening on http://127.0.0.1:4100"),
  );
