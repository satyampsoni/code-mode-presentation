import { mkdir, readFile, readdir, writeFile, rename } from "node:fs/promises";
import type { Metrics, RunTrace, TraceEvent } from "./types.js";
const directory = new URL("../../observability/metrics/", import.meta.url);
const recordings = new URL("../recordings/", import.meta.url);
interface Snapshot {
  source: string;
  recordingId: string;
  mode: string;
  model: string;
  recordedAt: string;
  metrics: Metrics;
}
const snapshots = new Map<string, Snapshot>();
let lastWritten = "";
let writes: Promise<void> = Promise.resolve(),
  timer: ReturnType<typeof setTimeout> | undefined;
function escape(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n");
}
function render() {
  const lines = [
    "# HELP agent_demo_measurement Actual saved or streamed travel agent measurements. Token estimates are identified by metric name.",
    "# TYPE agent_demo_measurement gauge",
    "# HELP agent_demo_recorded_timestamp_seconds Original capture time, not Prometheus scrape time.",
    "# TYPE agent_demo_recorded_timestamp_seconds gauge",
  ];
  for (const row of snapshots.values()) {
    const labels = `source="${escape(row.source)}",recording_id="${escape(row.recordingId)}",mode="${row.mode}",model="${escape(row.model)}",usage_source="${row.metrics.usageSource}"`;
    for (const [key, value] of Object.entries(row.metrics)) {
      if (typeof value === "number" && Number.isFinite(value))
        lines.push(
          `agent_demo_measurement{${labels},metric="${key}"} ${value}`,
        );
    }
    const ts = Date.parse(row.recordedAt) / 1000;
    if (Number.isFinite(ts))
      lines.push(`agent_demo_recorded_timestamp_seconds{${labels}} ${ts}`);
  }
  return lines.join("\n") + "\n";
}
function flush() {
  const value = render();
  writes = writes
    .catch(() => {})
    .then(async () => {
      if (lastWritten === value) return;
      await mkdir(directory, { recursive: true });
      const temp = new URL("metrics.tmp", directory);
      await writeFile(temp, value);
      await rename(temp, new URL("metrics.txt", directory));
      lastWritten = value;
    });
  return writes;
}
export async function refreshRecordedMetrics() {
  await mkdir(recordings, { recursive: true });
  for (const file of (await readdir(recordings)).filter((f) =>
    f.endsWith(".json"),
  )) {
    try {
      const r = JSON.parse(
        await readFile(new URL(file, recordings), "utf8"),
      ) as {
        id: string;
        model: string;
        recordedAt: string;
        traces: RunTrace[];
      };
      if (
        !["traditional", "code"].every((mode) =>
          r.traces.some((t) => t.mode === mode && t.status === "complete"),
        )
      )
        continue;
      for (const trace of r.traces)
        snapshots.set(`recorded:${r.id}:${trace.mode}`, {
          source: "recorded",
          recordingId: r.id,
          mode: trace.mode,
          model: trace.model,
          recordedAt: trace.recordedAt,
          metrics: trace.metrics,
        });
    } catch {}
  }
  await flush();
}
export function publishLiveMetric(event: TraceEvent) {
  if (!event.metrics) return;
  const model =
    (event.type === "run.start"
      ? (event.payload as { model?: string })?.model
      : undefined) ||
    snapshots.get(`live:${event.mode}`)?.model ||
    "configured-model";
  snapshots.set(`live:${event.mode}`, {
    source: "live",
    recordingId: "live",
    mode: event.mode,
    model,
    recordedAt: event.timestamp,
    metrics: event.metrics,
  });
  if (!timer)
    timer = setTimeout(() => {
      timer = undefined;
      void flush();
    }, 100);
}
