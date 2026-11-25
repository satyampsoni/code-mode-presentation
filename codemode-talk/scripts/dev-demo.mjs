import { spawn, spawnSync } from "node:child_process";
import { createConnection } from "node:net";
const children = [];
let stopping = false;
function start(args) {
  const p = spawn("npm", args, { stdio: "inherit", env: process.env });
  children.push(p);
  p.on("exit", (code) => {
    if (!stopping) {
      stop();
      process.exitCode = code || 0;
    }
  });
  return p;
}
function stop() {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
await import("../travel-lab/dist/observability.js").then((module) =>
  module.refreshRecordedMetrics(),
);
const observability = spawnSync(
  "docker",
  ["compose", "-f", "observability/compose.yaml", "up", "-d"],
  { stdio: "inherit" },
);
if (observability.status !== 0)
  console.warn(
    "Grafana is not running yet. Start Docker Desktop and run npm run observability:start.",
  );
start(["run", "start", "--workspace", "@codemode/travel-lab"]);
// Reuse an already running Next preview; start one if the port is free.
const socket = createConnection({ port: 3000, host: "127.0.0.1" });
socket.once("connect", () => {
  console.log("Reusing the existing Next.js app at http://localhost:3000/demo");
  socket.end();
});
socket.once("error", () => start(["run", "start"]));
