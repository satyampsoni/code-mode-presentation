import { cp, mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
export async function prepareObservability(directory) {
  const target = directory || await mkdtemp(join(tmpdir(), "code-mode-grafana-"));
  await mkdir(target, { recursive: true });
  const files = [
    "observability/cloud-run/start.sh",
    "observability/cloud-run/prometheus.yml",
    "observability/cloud-run/datasource.yaml",
    "observability/grafana/provisioning/dashboards/default.yaml",
    "travel-lab/src/observability.ts",
  ];
  for (const file of files) {
    const destination = join(target, file.replace(/^observability\//, ""));
    await mkdir(dirname(destination), { recursive: true });
    await cp(join(root, file), destination);
  }
  await cp(join(root, "observability/cloud-run/Dockerfile"), join(target, "Dockerfile"));
  const dashboard = JSON.parse(await readFile(join(root, "observability/grafana/dashboards/travel-demo.json"), "utf8"));
  dashboard.title = "NitroStack · Recorded agent execution";
  dashboard.tags = ["nitrostack", "mcp", "recorded"];
  const dashboardPath = join(target, "grafana/dashboards/travel-demo.json");
  await mkdir(dirname(dashboardPath), { recursive: true });
  await writeFile(dashboardPath, JSON.stringify(dashboard, null, 2));
  const recordings = join(root, "travel-lab/recordings");
  const destination = join(target, "travel-lab/recordings");
  await mkdir(destination, { recursive: true });
  let pairs = 0;
  for (const file of (await readdir(recordings)).filter((name) => /^[a-f0-9-]{36}\.json$/i.test(name))) {
    const record = JSON.parse(await readFile(join(recordings, file), "utf8"));
    if (!Array.isArray(record.traces) || !["traditional", "code"].every((mode) => record.traces.some((trace) => trace.mode === mode && trace.status === "complete"))) continue;
    // Cloud Build receives only public aggregate measurements, never raw events,
    // generated scripts, provider credentials, local env files, or prompts.
    const snapshot = {
      id: record.id, model: record.model, recordedAt: record.recordedAt,
      traces: record.traces.map(({ mode, status, recordedAt, model, metrics }) => ({ mode, status, recordedAt, model, metrics })),
    };
    await writeFile(join(destination, file), JSON.stringify(snapshot));
    pairs++;
  }
  if (!pairs) throw new Error("No genuine complete recording pairs found.");
  await writeFile(join(target, ".gcloudignore"), ".git\n.env*\nnode_modules\n");
  return { directory: target, recordingPairs: pairs };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await prepareObservability(process.argv[2]), null, 2));
}
