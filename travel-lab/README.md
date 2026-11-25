# The travel lab

A working local NitroStack 1.1.3 engineering demonstration. The browser drives an OpenAI-compatible Chat Completions agent, which connects over MCP stdio to a separate NitroStack server process for each execution. The traditional configuration exposes individual tools. Code Mode uses the SDK's `CodeModeTransform`, exposing `search`, `get_schema` and `execute`, and executes the model's JavaScript in the SDK's QuickJS WASM worker.

All travel data is deterministic sample data. Nothing here books tickets or reads real flight availability.

## Install and launch

From the repository root:

```sh
npm install
cp .env.example .env.local  # only if you have not created it already
# Edit .env.local locally; never commit credentials.
npm run demo
```

Open [the lab](http://localhost:3000/demo). `npm run demo` compiles the separate travel workspace, starts the agent backend on `127.0.0.1:4100`, and starts Next.js on port 3000, or reuses an already running Next.js preview. Press Ctrl+C in the launcher terminal to stop the services it owns. The existing slideshow remains at `/`.

Node 22.15+ is recommended. The `.env.local` file is loaded server-side by the agent backend. Restart `npm run demo` after changing credentials, model, endpoint, pricing or backend configuration. No provider credentials are passed to MCP server subprocesses or to the browser.

| Variable                             | Purpose                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `OPENAI_API_KEY`                     | Provider API key. For a local compatible service that does not enforce keys, use an explicit non-secret value such as `local`. |
| `OPENAI_MODEL`                       | Exact model identifier accepted by the selected provider.                                                                      |
| `OPENAI_BASE_URL`                    | Compatible API base, including `/v1` where appropriate. Defaults to `https://api.openai.com/v1`.                               |
| `MODEL_INPUT_USD_PER_MILLION`        | Optional price for uncached input tokens.                                                                                      |
| `MODEL_OUTPUT_USD_PER_MILLION`       | Optional output-token price.                                                                                                   |
| `MODEL_CACHED_INPUT_USD_PER_MILLION` | Optional cached-input price; defaults to the input price.                                                                      |
| `MODEL_MAX_ROUNDS`                   | Model request budget per run (default 12).                                                                                     |
| `MODEL_MAX_COMPLETION_TOKENS`        | Optional output limit. Omitted from requests when unset.                                                                       |
| `DEMO_AGENT_PORT`                    | Local backend port (default 4100). Must match the Next.js environment.                                                         |

Set `MODEL_SERIALIZE_REQUESTS=1` for a shared free-tier provider such as Groq. This coordinates model HTTP requests and retry waits through one slot; independent underlying tool calls can still run in parallel. Provider queue time is included in measured latency. The default is off for other deployments.

The backend uses `/chat/completions` for broad OpenAI-compatible provider support. It passes the full discovered catalog as function tools in traditional mode, allows the model to select parallel calls, executes independent calls with `Promise.all`, and never substitutes a canned model response. Provider errors, context limits, unsupported model features and tool-count limits are shown honestly. HTTP 429 responses are retried at most five times per model turn, respecting the provider retry hint with a 1–120 second delay. Waits are streamed as events and included in latency; unsuccessful attempts count as model API requests. In particular, some providers limit requests to 128 function tools; a 1,000-tool traditional catalog can legitimately fail. No silent curation or artificial batching of the catalog is applied.

## The five-minute conference path

Use keys `1`–`5` to jump between stages, or `[` and `]` to advance. These shortcuts ignore editable fields. Stage navigation never triggers a paid model request by itself.

1. **The working tools:** Build Mode → `src/travel.tools.ts`, `src/travel.service.ts` and `src/dataset.ts`. Show the ten real travel tools and shared sample data.
2. **One configuration change:** `src/app.module.ts`. The actual change is `transforms: mode === 'code' ? [new CodeModeTransform(sandboxOptions)] : []`.
3. **A different tool surface:** Connect Claude Code to one server at a time. Compare the individual catalog with the three Code Mode interfaces. Architecture tab also shows live events after a run.
4. **Model-generated workflow:** Execution tab → Run Both with the same prompt and catalog. Inspect discovery, each model request and response, generated arguments, actual generated JavaScript, and tool results.
5. **Measured comparison:** Scroll to metrics, inspect the final options, and expand any event. Model input/output counts use provider usage where available. No performance improvement is assumed.

## Commands verified against the installed SDK and CLI

The scaffold command is shown for teaching, not run during normal startup; the implemented server already exists and its dependencies are installed:

```sh
npx @nitrostack/cli@1.1.3 init travel-example --preset code-mode --skip-install
npm run build:lab
npm run demo
```

The Build Mode tab reads exact working files and generates copyable commands with the absolute path to `travel-lab/dist/server.js`. The current Claude Code CLI supports:

```sh
# Run these from the repository root; replace the absolute path with your checkout.
claude mcp add --transport stdio --env TRAVEL_MODE=traditional --env TRAVEL_CATALOG_SIZE=10 travel-traditional -- node /ABSOLUTE/PATH/travel-lab/dist/server.js
claude mcp add --transport stdio --env TRAVEL_MODE=code --env TRAVEL_CATALOG_SIZE=10 travel-code -- node /ABSOLUTE/PATH/travel-lab/dist/server.js
claude mcp list
```

For a clean external Claude Code comparison, enable one travel server at a time in Claude Code's MCP controls. Avoid mixing both tool surfaces in the same conversation. This project does not alter your Claude Code configuration automatically.

Standalone servers also work directly:

```sh
TRAVEL_MODE=traditional TRAVEL_CATALOG_SIZE=10 node travel-lab/dist/server.js
TRAVEL_MODE=code TRAVEL_CATALOG_SIZE=1000 node travel-lab/dist/server.js
```

The servers speak JSON-RPC on stdio. They are intended for an MCP client, not interactive terminal text input.

## Actual Code Mode contract

Verified from the installed 1.1.3 source and the official GitHub example:

```ts
new CodeModeTransform({
  workerPoolSize: 1,
  memoryLimitMb: 64,
  timeoutMs: 2000,
  maxToolCalls: 40,
  allowDestructive: false,
  // The implemented file also sets executeToolDescription to explain
  // that code is an async function BODY, not an uninvoked function.
});
```

The meta-tools accept:

```json
{"name":"search","arguments":{"query":"flight search baggage","limit":10}}
{"name":"get_schema","arguments":{"tools":["search_flights","get_baggage_policy"]}}
{"name":"execute","arguments":{"code":"return await callTool('search_flights', {from:'BLR',to:'SYD'});"}}
```

`get_schema` uses **`tools: string[]`** in this installed release. Some older documentation snippets use `toolName`; this demo follows the package's actual schema. `callTool()` returns the underlying handler result directly. The script is an async function body, with ES2020 features and a JSON return value. No generated SDK method is invented. Tool-boundary telemetry is captured on the host; this SDK does not expose executed-line instrumentation, so the editor deliberately avoids claiming line-level execution highlighting.

`search_flights` sorts by ascending price and excludes sold-out flights by default. Set `availableOnly:false` to inspect sold-out fixtures; `check_availability` and `get_flight_details` remain available for any fixture ID. These defaults are shared by both execution modes.

The main fixture query's expected IDs, in price order, are `NS-104` (₹33,700, 20 kg), `NS-107` (₹35,200, 20 kg), and `NS-102` (₹36,400, 25 kg). Sold-out, over-budget and insufficient-baggage options are excluded. Models may use different valid call sequences to reach the same answer.

## Catalogs and metrics

Exactly 10, 100 or 1,000 tools are registered using NitroStack method decorators. All ten primary tools are present at every size. Additional read-only reference lookups cover hotels, rail, rental cars, insurance, visas, cruises, ferries, tours, loyalty, transfers and accessibility across sample regions and policy facets. They are callable fixture lookups, not descriptions of live provider integrations.

- **Initial definitions:** serialized function-tool payload bytes and estimated tokens (`ceil(UTF-8 bytes / 4)`); explicitly not an exact tokenizer or provider billing measurement.
- **Input/output tokens:** sums of provider `usage.prompt_tokens` and `usage.completion_tokens`. If omitted by a compatible provider, estimates are labeled. Cached input is tracked when reported.
- **Model API requests:** one per actual HTTP model request, including requests that fail or are retried.
- **Underlying tool calls:** starts captured from actual controller execution, independent of MCP meta-tool calls and model requests.
- **Intermediate bytes:** serialized MCP tool responses appended to model messages, including search/schema results, errors and final execute result. Internal sandbox travel payloads are visible in the inspector but are not added to this metric.
- **Latency:** wall time including process startup, model requests and cleanup. Concurrent runs share machine and provider resources; this is a teaching comparison, not a statistically controlled benchmark.
- **Cost:** an estimate using configured input, cached-input and output prices. No cost is shown if prices are absent. Provider-specific discounts or billing rules may differ.
- **Percentages:** calculated from completed runs: `(traditional - code) / traditional × 100`. Zero baselines display no percentage. Estimates remain estimates even when compared.

## Genuine recordings and offline fallback

Every fully successful run is saved under `travel-lab/recordings/` after credential redaction. Failed or cancelled runs are never presented as successful offline traces. The filename is a UUID; no arbitrary file path is accepted from the browser.

To capture a pair without browser interaction:

```sh
npm run record:demo
```

This calls your actual configured model in both modes with the same prompt. It does not synthesize an execution. Once recorded, choose **Recorded replay** and select the recording. The UI clearly displays **RECORDED REPLAY · NOT LIVE**, the original timestamp, model and recorded metrics. Playback is accelerated (gaps capped at 250 ms). No model API calls occur during replay; all displayed metrics belong to the original run. Prompt/catalog controls are locked to the recorded values.

Only genuine successful executions are offered as recordings. The CLI validates the main prompt against the expected flight IDs before saving. Diagnostic failed attempts are kept separately in ignored `travel-lab/.debug/` and never offered as replay. Keep dependencies installed, launch the local services, and check your saved recording with internet disconnected before the talk.

## Security test and verification

Architecture → **Test actual execution timeout** runs `while (true) {}` through the actual `execute` MCP tool. QuickJS's configured 2-second execution budget terminates it. The response includes the real error and wall time, and it does not change the main agent comparison. Sandboxing does not replace auth. The demonstration uses local stdio child processes and a loopback-only agent backend. The Next API enforces same-origin requests and forwards only fixed endpoints. Do not publish the credentialed demo as an unauthenticated public service.

```sh
npm run test:demo
npm run typecheck
npm run build
```

Integration tests use actual MCP transports and the actual sandbox. They verify matching flight results, callable 100/1,000 catalogs, discovery schemas, timeout enforcement, unknown-tool rejection, isolation of Node globals, worker recovery and credential redaction. These tests do not replace the credentialed end-to-end model run.

## Source references

- [NitroStack Code Mode template docs](https://docs.nitrostack.ai/docs/templates/code-mode)
- [Official Code Mode app module](https://github.com/nitrocloudofficial/nitrostack/blob/main/typescript/packages/cli/templates/typescript-code-mode/src/app.module.ts)
- [Official sandbox sample](https://github.com/nitrocloudofficial/nitrostack/blob/main/typescript/packages/cli/templates/typescript-code-mode/src/scripts/sample-batch.js)
- [Official Code Mode implementation](https://github.com/nitrocloudofficial/nitrostack/tree/main/typescript/packages/core/src/core/transforms/code-mode)
- [OpenAI-compatible Chat Completions reference](https://developers.openai.com/api/reference/typescript/resources/chat/subresources/completions/methods/create)

The current upstream SDK/CLI dependency tree reports npm advisories, including Zod collection validation and CLI-only build/archive dependencies. Versions are pinned to the verified NitroStack release; input sizes are capped locally. Do not use this conference lab as a production security baseline.
