import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { hostedDemo } from "../lib/hosted-demo.ts";

const request = (endpoint, data) => new Request(`https://example.test/api/demo/${endpoint}`, data === undefined ? {} : {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data),
});
test("hosted status lists complete pairs without enabling provider calls", async () => {
  const response = await hostedDemo(request("status"), "status");
  const status = await response.json();
  assert.equal(status.executionMode, "recorded");
  assert.equal(status.providerConfigured, false);
  assert.ok(status.recordings.length > 0);
  assert.ok(status.recordings.every((r) => r.modes.includes("traditional") && r.modes.includes("code")));
});
test("hosted replay rejects malformed, missing, and invalid-mode requests", async () => {
  for (const data of [{ id: "../../.env.local" }, { id: "5ea9dc58-41b9-4478-b413-016051667784", mode: "fake" }]) {
    assert.equal((await hostedDemo(request("replay", data), "replay")).status, 400);
  }
  assert.equal((await hostedDemo(request("replay", { id: "00000000-0000-0000-0000-000000000000" }), "replay")).status, 404);
});
test("hosted mode never starts live provider or sandbox execution", async () => {
  for (const endpoint of ["run", "security"]) assert.equal((await hostedDemo(request(endpoint, {}), endpoint)).status, 409);
});
test("single-mode and paired replay preserve genuine saved answers and metrics", { timeout: 60000 }, async () => {
  const id = "5ea9dc58-41b9-4478-b413-016051667784";
  const original = JSON.parse(await readFile(new URL(`../travel-lab/recordings/${id}.json`, import.meta.url), "utf8"));
  await Promise.all(["traditional", "code", "both"].map(async (mode) => {
    const response = await hostedDemo(request("replay", { id, mode }), "replay");
    assert.equal(response.headers.get("content-type"), "text/event-stream");
    const messages = (await response.text()).split("\n\n").filter((line) => line.startsWith("data: ")).map((line) => JSON.parse(line.slice(6)));
    const expected = original.traces.filter((trace) => mode === "both" || trace.mode === mode);
    const complete = messages.at(-1);
    assert.equal(messages[0].type, "session.replay");
    assert.equal(complete.type, "session.complete");
    assert.equal(complete.replay, true);
    assert.deepEqual(complete.traces.map((t) => ({ mode: t.mode, answer: t.answer, metrics: t.metrics })), expected.map((t) => ({ mode: t.mode, answer: t.answer, metrics: t.metrics })));
    assert.ok(messages.filter((event) => event.mode).every((event) => mode === "both" || event.mode === mode));
  }));
});
test("build walkthrough exposes only the source allowlist", async () => {
  const response = await hostedDemo(request("sources"), "sources");
  const sources = await response.json();
  assert.equal(sources.files.length, 8);
  assert.ok(sources.files.every((file) => !file.path.includes(".env") && file.code.length > 0));
  assert.ok(sources.commands.code.includes("TRAVEL_MODE=code"));
});
