import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { connectMcp, unpack } from "./mcp-client.js";
import { DATASET_VERSION } from "./dataset.js";
import { redact } from "./redact.js";
import type { Metrics, Mode, RunTrace, TraceEvent } from "./types.js";
let providerQueue: Promise<void> = Promise.resolve();
let pendingProviderRequests = 0;
async function withProviderSlot(
  action: () => Promise<void>,
  onQueue: () => void,
  signal?: AbortSignal,
) {
  if (process.env.MODEL_SERIALIZE_REQUESTS !== "1") return action();
  const previous = providerQueue;
  let release: () => void = () => {};
  providerQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  if (pendingProviderRequests > 0) onQueue();
  pendingProviderRequests++;
  await previous;
  try {
    signal?.throwIfAborted();
    await action();
  } finally {
    pendingProviderRequests--;
    release();
  }
}
export const estimateTokens = (value: unknown) =>
  Math.ceil(
    Buffer.byteLength(
      typeof value === "string" ? value : JSON.stringify(value),
      "utf8",
    ) / 4,
  );
export const emptyMetrics = (catalogSize: number): Metrics => ({
  exposedTools: 0,
  catalogSize,
  initialDefinitionTokens: 0,
  initialDefinitionBytes: 0,
  inputTokens: 0,
  outputTokens: 0,
  cachedInputTokens: 0,
  modelRequests: 0,
  toolCalls: 0,
  intermediateBytes: 0,
  latencyMs: 0,
  costUSD: null,
  usageSource: "provider",
});
interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}
interface Message {
  role: string;
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}
interface ProviderReply {
  choices: {
    message: { content?: string; tool_calls?: ToolCall[] };
    finish_reason?: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    prompt_tokens_details?: { cached_tokens?: number };
  };
  error?: { message?: string };
  model?: string;
}
export async function runAgent(
  mode: Mode,
  prompt: string,
  catalogSize: number,
  onEvent: (e: TraceEvent) => void,
  signal?: AbortSignal,
): Promise<RunTrace> {
  const runId = randomUUID(),
    start = performance.now(),
    metrics = emptyMetrics(catalogSize),
    events: TraceEvent[] = [];
  const trace: RunTrace = {
    version: 1,
    runId,
    mode,
    prompt,
    catalogSize,
    model: process.env.OPENAI_MODEL || "",
    dataset: DATASET_VERSION,
    recordedAt: new Date().toISOString(),
    status: "error",
    events,
    metrics,
  };
  const emit = (
    type: string,
    name: string,
    payload?: unknown,
    durationMs?: number,
  ) => {
    metrics.latencyMs = Math.round(performance.now() - start);
    const event: TraceEvent = {
      id: randomUUID(),
      runId,
      mode,
      type,
      name,
      timestamp: new Date().toISOString(),
      durationMs,
      payload: redact(payload),
      metrics: { ...metrics },
    };
    events.push(event);
    onEvent(event);
  };
  let connection: Awaited<ReturnType<typeof connectMcp>> | undefined;
  try {
    emit("run.start", "Starting live MCP session", {
      mode,
      catalogSize,
      prompt,
      dataset: DATASET_VERSION,
      model: trace.model,
    });
    connection = await connectMcp(mode, catalogSize, (event) => {
      if (event.type === "tool.start") metrics.toolCalls++;
      emit(
        String(event.type),
        String(event.name),
        event,
        typeof event.durationMs === "number" ? event.durationMs : undefined,
      );
    });
    const cleanup = () => {
      void connection?.close();
    };
    signal?.addEventListener("abort", cleanup, { once: true });
    emit("discovery.request", "tools/list", {
      jsonrpc: "2.0",
      method: "tools/list",
      params: {},
    });
    const tools: Awaited<
      ReturnType<typeof connection.client.listTools>
    >["tools"] = [];
    let cursor: string | undefined;
    do {
      const page = await connection.client.listTools(cursor ? { cursor } : {});
      tools.push(...page.tools);
      cursor = page.nextCursor;
    } while (cursor);
    const functions = tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema,
      },
    }));
    metrics.exposedTools = tools.length;
    metrics.initialDefinitionBytes = Buffer.byteLength(
      JSON.stringify(functions),
    );
    metrics.initialDefinitionTokens = estimateTokens(functions);
    emit("discovery.result", `${tools.length} tools exposed`, {
      tools,
      definitionTokensEstimated: metrics.initialDefinitionTokens,
      definitionBytes: metrics.initialDefinitionBytes,
    });
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)
      throw new Error(
        "Configure OPENAI_API_KEY and OPENAI_MODEL in .env.local, then restart npm run demo. No model request was made.",
      );
    const common =
      "You are a travel research agent querying an Exasol fare warehouse of historical prices, baggage policies and availability. Follow the user request faithfully and only use available capabilities. All prices are per adult INR. Unless the user explicitly requests sold-out options, only recommend available flights (seats > 0). Do not invent tool results. When complete, return JSON as assistant message content, with no tool calls. JSON is a text format, never a tool or function name. For a current-offer search, return an options array where each item includes id, airline, price and checkedKg, plus a brief explanation. For a historical analysis, call search_flights with historyMonths and return cheapestMonth, cheapestFare and airlines (airline, airlineCode, checkedKg, fare) from that result, plus a brief explanation. Bengaluru is BLR and Sydney is SYD.";
    const system =
      common +
      (mode === "code"
        ? ' Discover tools with search, inspect exact schemas with get_schema, then write ES2020 JavaScript for execute. The code string is the BODY of an async function, executed immediately: use top-level await callTool(name,argsObject) and return a JSON value. Never submit a bare async () => {...} or uninvoked function: that returns null without calling tools. No Markdown fences. Tool-agnostic contract example: const result = await callTool("tool_name", {}); return result; callTool returns the tool handler result directly (not an MCP content envelope). Use Promise.all for independent requests if useful. Do not invoke meta-tools through callTool. No Node globals, import, fetch, require or process. Keep intermediate data in the sandbox. Return only necessary final options.'
        : " Use the individual MCP tools to answer. Choose parallel or sequential calls according to dependencies.");
    const messages: Message[] = [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ];
    let measured = 0,
      estimated = 0;
    for (
      let turn = 0;
      turn < Number(process.env.MODEL_MAX_ROUNDS || 12);
      turn++
    ) {
      signal?.throwIfAborted();
      const body = {
        model: process.env.OPENAI_MODEL,
        messages,
        tools: functions,
        tool_choice: "auto",
        ...(process.env.MODEL_MAX_COMPLETION_TOKENS
          ? {
              max_completion_tokens: Number(
                process.env.MODEL_MAX_COMPLETION_TOKENS,
              ),
            }
          : {}),
      };
      let data: ProviderReply = { choices: [] };
      let modelStart = performance.now();
      const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      await withProviderSlot(
        async () => {
          for (let attempt = 0; attempt < 6; attempt++) {
            signal?.throwIfAborted();
            metrics.modelRequests++;
            emit("model.request", `Model request ${metrics.modelRequests}`, {
              model: body.model,
              messages: structuredClone(body.messages),
              toolChoice: body.tool_choice,
              toolNames: tools.map((t) => t.name),
              toolDefinitionCount: tools.length,
              toolDefinitionsReference: "discovery.result",
              turn: turn + 1,
              attempt: attempt + 1,
            });
            modelStart = performance.now();
            const response = await fetch(
              `${base.replace(/\/$/, "")}/chat/completions`,
              {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify(body),
                signal: AbortSignal.any([
                  signal || new AbortController().signal,
                  AbortSignal.timeout(90000),
                ]),
              },
            );
            const text = await response.text();
            try {
              data = JSON.parse(text);
            } catch {
              throw new Error(
                `Provider returned non-JSON (HTTP ${response.status})`,
              );
            }
            if (response.status === 429 && attempt < 5) {
              const header = response.headers.get("retry-after");
              const hint = String(data.error?.message || "").match(
                /try again in (?:(\d+)m)?([\d.]+)s/i,
              );
              const seconds =
                header && Number.isFinite(Number(header))
                  ? Number(header)
                  : hint
                    ? Number(hint[1] || 0) * 60 + Number(hint[2])
                    : Math.min(30, 2 ** (attempt + 1));
              const waitMs = Math.max(
                1000,
                Math.min(120000, Math.ceil(seconds * 1000) + 500),
              );
              emit(
                "model.rate_limit",
                `Rate limited · retrying in ${(waitMs / 1000).toFixed(1)}s`,
                {
                  httpStatus: 429,
                  retry: attempt + 1,
                  maxRetries: 5,
                  waitMs,
                  providerMessage: data.error?.message,
                },
                performance.now() - modelStart,
              );
              await delay(waitMs, undefined, { signal });
              continue;
            }
            if(response.status===400 && attempt<5 && body.tool_choice!=="none" && /attempted to call tool ['"]JSON['"]/i.test(data.error?.message||"")) {
              emit("model.repair", "Provider rejected a nonexistent JSON tool", {httpStatus:400,providerMessage:data.error?.message,action:"Request final assistant content using tool_choice:none; no tool result is fabricated."});
              body.tool_choice="none";
              body.messages=[...messages,{role:"system",content:"JSON is not a callable tool. Use the actual tool results already obtained to answer as JSON text in assistant content. If the data is insufficient, say so rather than inventing facts. Do not request another tool."}];
              continue;
            }
            if (!response.ok)
              throw new Error(
                `Provider HTTP ${response.status}: ${data.error?.message || "Request rejected"}`,
              );
            break;
          }
        },
        () =>
          emit("model.queue", "Waiting for provider slot", {
            reason:
              "Configured provider concurrency is 1; tool calls are not serialized.",
          }),
        signal,
      );
      const raw = data.choices?.[0]?.message;
      if (!raw) throw new Error("Provider response has no assistant message");
      const message: Message = {
        role: "assistant",
        content: raw.content || null,
        ...(raw.tool_calls?.length ? { tool_calls: raw.tool_calls } : {}),
      };
      if (
        data.usage &&
        Number.isFinite(data.usage.prompt_tokens) &&
        Number.isFinite(data.usage?.completion_tokens)
      ) {
        metrics.inputTokens += data.usage.prompt_tokens;
        metrics.outputTokens += data.usage.completion_tokens;
        metrics.cachedInputTokens +=
          data.usage.prompt_tokens_details?.cached_tokens || 0;
        measured++;
      } else {
        metrics.inputTokens += estimateTokens(body);
        metrics.outputTokens += estimateTokens(message);
        estimated++;
      }
      metrics.usageSource = estimated
        ? measured
          ? "mixed"
          : "estimated"
        : "provider";
      const inputPrice = Number(process.env.MODEL_INPUT_USD_PER_MILLION),
        outputPrice = Number(process.env.MODEL_OUTPUT_USD_PER_MILLION),
        cachedPrice = Number(
          process.env.MODEL_CACHED_INPUT_USD_PER_MILLION ||
            process.env.MODEL_INPUT_USD_PER_MILLION,
        );
      if (
        process.env.MODEL_INPUT_USD_PER_MILLION &&
        process.env.MODEL_OUTPUT_USD_PER_MILLION &&
        [inputPrice, outputPrice, cachedPrice].every(
          (n) => Number.isFinite(n) && n >= 0,
        )
      )
        metrics.costUSD =
          ((metrics.inputTokens - metrics.cachedInputTokens) * inputPrice +
            metrics.cachedInputTokens * cachedPrice +
            metrics.outputTokens * outputPrice) /
          1000000;
      emit(
        "model.response",
        `Model response ${metrics.modelRequests}`,
        {
          message,
          servedModel: data.model || trace.model,
          usage: data.usage || null,
          finishReason: data.choices[0].finish_reason,
        },
        performance.now() - modelStart,
      );
      messages.push(message);
      if (!message.tool_calls?.length) {
        if (data.choices[0].finish_reason === "length")
          throw new Error(
            "Provider output limit reached before a final answer",
          );
        trace.answer = unpack({
          content: [
            {
              type: "text",
              text: (message.content || "")
                .trim()
                .replace(/^```(?:json)?\s*/i, "")
                .replace(/\s*```$/, ""),
            },
          ],
        });
        trace.status = "complete";
        emit("run.complete", "Final answer", { answer: trace.answer });
        break;
      }
      const results = await Promise.all(
        message.tool_calls.map(async (call) => {
          let args: Record<string, unknown>;
          try {
            args = JSON.parse(call.function.arguments);
          } catch {
            args = {};
          }
          emit("mcp.request", call.function.name, {
            jsonrpc: "2.0",
            method: "tools/call",
            params: { name: call.function.name, arguments: args },
            modelToolCallId: call.id,
          });
          if (call.function.name === "execute")
            emit("code.generated", "Model-generated JavaScript", {
              code: args.code,
              instrumentation:
                "Tool boundaries only; NitroStack does not expose line-level execution hooks.",
            });
          const callStart = performance.now();
          let result: unknown;
          try {
            result = await connection!.client.callTool(
              { name: call.function.name, arguments: args },
              undefined,
              { timeout: 20000 },
            );
          } catch (error) {
            result = {
              isError: true,
              content: [{ type: "text", text: String(error) }],
            };
          }
          const serialized = JSON.stringify(result);
          metrics.intermediateBytes += Buffer.byteLength(serialized);
          emit(
            "mcp.response",
            call.function.name,
            {
              result,
              modelToolCallId: call.id,
              bytesToModel: Buffer.byteLength(serialized),
            },
            performance.now() - callStart,
          );
          return {
            role: "tool",
            tool_call_id: call.id,
            content: serialized,
          } as Message;
        }),
      );
      messages.push(...results);
    }
    if (trace.status !== "complete")
      throw new Error(
        `Model did not finish within ${process.env.MODEL_MAX_ROUNDS || 12} requests`,
      );
    signal?.removeEventListener("abort", cleanup);
  } catch (error) {
    trace.error = String(
      redact(error instanceof Error ? error.message : String(error)),
    );
    emit("run.error", "Execution failed", { error: trace.error });
  } finally {
    await connection?.close().catch(() => {});
    metrics.latencyMs = Math.round(performance.now() - start);
  }
  return trace;
}
