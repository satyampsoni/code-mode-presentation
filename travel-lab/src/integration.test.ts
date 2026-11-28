import test from "node:test";
import assert from "node:assert/strict";
import { connectMcp, unpack } from "./mcp-client.js";
import { expectedOptions } from "./dataset.js";
import { redact } from "./redact.js";
const script = `const data = await callTool('search_flights', {from:'BLR',to:'SYD',maxPrice:40000,availableOnly:true});
const checked = await Promise.all(data.flights.map(async f => {
  const baggage = await callTool('get_baggage_policy', {flightId:f.id});
  return {...f, checkedKg:baggage.checkedKg};
}));
return {options:checked.filter(f=>f.checkedKg>=20).sort((a,b)=>a.price-b.price).slice(0,3)};`;
function assertSuccess(result: unknown) {
  assert.equal(
    (result as { isError?: boolean }).isError,
    undefined,
    JSON.stringify(result),
  );
  return unpack(result);
}
test("both real MCP transports return the same three eligible flight IDs", async () => {
  const traditional = await connectMcp("traditional", 10),
    code = await connectMcp("code", 10);
  try {
    const regular = await traditional.client.listTools(),
      meta = await code.client.listTools();
    assert.equal(regular.tools.length, 10);
    assert.deepEqual(
      meta.tools.map((t) => t.name),
      ["search", "get_schema", "execute"],
    );
    const discovery = await code.client.callTool({
      name: "search",
      arguments: { query: "flight search baggage", limit: 10 },
    });
    assert.match(String(unpack(discovery)), /search_flights/);
    const schemas = await code.client.callTool({
      name: "get_schema",
      arguments: { tools: ["search_flights", "get_baggage_policy"] },
    });
    assert.match(String(unpack(schemas)), /flightId/);
    const defaults=assertSuccess(await traditional.client.callTool({name:"search_flights",arguments:{from:"BLR",to:"SYD"}})) as {flights:{seats:number;price:number}[]};
    assert.ok(defaults.flights.every(f=>f.seats>0));
    assert.deepEqual(defaults.flights.map(f=>f.price),defaults.flights.map(f=>f.price).sort((a,b)=>a-b));
    const all=assertSuccess(await traditional.client.callTool({name:"search_flights",arguments:{from:"BLR",to:"SYD",availableOnly:false}})) as {flights:{id:string}[]};
    assert.ok(all.flights.some(f=>f.id==="NS-106"));
    const data = assertSuccess(
      await traditional.client.callTool({
        name: "search_flights",
        arguments: {
          from: "Bengaluru",
          to: "Sydney",
          maxPrice: 40000,
          availableOnly: true,
        },
      }),
    ) as { flights: { id: string; price: number }[] };
    const withBaggage = await Promise.all(
      data.flights.map(async (f) => {
        const policy = assertSuccess(
          await traditional.client.callTool({
            name: "get_baggage_policy",
            arguments: { flightId: f.id },
          }),
        ) as { checkedKg: number };
        return { ...f, ...policy };
      }),
    );
    const a = withBaggage
      .filter((f) => f.checkedKg >= 20)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3)
      .map((f) => f.id);
    const b = assertSuccess(
      await code.client.callTool({
        name: "execute",
        arguments: { code: script },
      }),
    ) as { options: { id: string }[] };
    assert.deepEqual(a, expectedOptions);
    assert.deepEqual(
      b.options.map((f) => f.id),
      a,
    );
  } finally {
    await traditional.close();
    await code.close();
  }
});
for (const size of [100, 1000])
  test(`${size} tools are real, callable, and collapse to three meta-tools`, async () => {
    const traditional = await connectMcp("traditional", size),
      code = await connectMcp("code", size);
    try {
      const list = await traditional.client.listTools();
      assert.equal(list.tools.length, size);
      assert.equal((await code.client.listTools()).tools.length, 3);
      const extra = list.tools.at(-1)!;
      const direct = assertSuccess(
        await traditional.client.callTool({
          name: extra.name,
          arguments: { referenceId: "test" },
        }),
      );
      const runtime = assertSuccess(
        await code.client.callTool({
          name: "execute",
          arguments: {
            code: `return await callTool(${JSON.stringify(extra.name)}, {referenceId:'test'});`,
          },
        }),
      );
      assert.deepEqual(runtime, direct);
    } finally {
      await traditional.close();
      await code.close();
    }
  });
test("actual QuickJS timeout, unknown capability, globals isolation and recovery", async () => {
  const code = await connectMcp("code", 10);
  try {
    await code.client.listTools();
    const blocked = await code.client.callTool(
      { name: "execute", arguments: { code: "while (true) {}" } },
      undefined,
      { timeout: 10000 },
    );
    assert.equal((blocked as { isError?: boolean }).isError, true);
    assert.match(String(unpack(blocked)), /timeout|timed out|interrupt/i);
    const denied = await code.client.callTool({
      name: "execute",
      arguments: { code: "return await callTool('admin_delete_all', {});" },
    });
    assert.equal((denied as { isError?: boolean }).isError, true);
    assert.deepEqual(
      assertSuccess(
        await code.client.callTool({
          name: "execute",
          arguments: {
            code: "return {process:typeof process,require:typeof require,fetch:typeof fetch};",
          },
        }),
      ),
      { process: "undefined", require: "undefined", fetch: "undefined" },
    );
    assert.deepEqual(
      assertSuccess(
        await code.client.callTool({
          name: "execute",
          arguments: { code: "return {recovered:true};" },
        }),
      ),
      { recovered: true },
    );
  } finally {
    await code.close();
  }
});
test("trace redaction removes credentials and sensitive headers", () => {
  assert.deepEqual(
    redact({
      authorization: "Bearer secret",
      nested: { apiKey: "secret", cookie: "session" },
      inputTokens: 100,
    }),
    {
      authorization: "[REDACTED]",
      nested: { apiKey: "[REDACTED]", cookie: "[REDACTED]" },
      inputTokens: 100,
    },
  );
});

// A provider test double exercises the agent loop only. It is never recorded or exposed as live/replay data.
test("agent loop uses actual tool results, tracks provider usage and supports parallel model calls", async () => {
  const { mock } = await import("node:test");
  const { runAgent } = await import("./runner.js");
  const savedKey = process.env.OPENAI_API_KEY,
    savedModel = process.env.OPENAI_MODEL;
  process.env.OPENAI_API_KEY = "unit-test-only";
  process.env.OPENAI_MODEL = "unit-test-provider";
  let requests = 0;
  const seen: unknown[] = [];
  const f = mock.method(
    globalThis,
    "fetch",
    async (_url: unknown, init: RequestInit) => {
      requests++;
      const payload = JSON.parse(String(init.body));
      seen.push(payload);
      if (requests === 1)
        return new Response(
          JSON.stringify({
            error: { message: "Test rate limit. Please try again in 0.01s." },
          }),
          {
            status: 429,
            headers: {
              "content-type": "application/json",
              "retry-after": "0.01",
            },
          },
        );
      if(requests===4)return new Response(JSON.stringify({error:{message:"Tool call validation failed: attempted to call tool 'JSON' which was not in request.tools"}}),{status:400,headers:{"content-type":"application/json"}});
      if(requests===5)assert.equal(payload.tool_choice,"none");
      const last = payload.messages.at(-1);
      let message;
      if (requests === 2)
        message = {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "test-search",
              type: "function",
              function: {
                name: "search_flights",
                arguments: JSON.stringify({
                  from: "BLR",
                  to: "SYD",
                  maxPrice: 40000,
                  availableOnly: true,
                }),
              },
            },
          ],
        };
      else if (requests === 3) {
        const data = JSON.parse(last.content);
        const text = data.content?.find(
          (x: { type: string }) => x.type === "text",
        )?.text;
        const parsed = data.structuredContent || JSON.parse(text);
        assert.ok(parsed.flights.length > 0);
        message = {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "test-baggage-1",
              type: "function",
              function: {
                name: "get_baggage_policy",
                arguments: '{"flightId":"NS-104"}',
              },
            },
            {
              id: "test-baggage-2",
              type: "function",
              function: {
                name: "get_baggage_policy",
                arguments: '{"flightId":"NS-107"}',
              },
            },
          ],
        };
      } else
        message = {
          role: "assistant",
          content: JSON.stringify({ sampleData: true, options: [] }),
        };
      return new Response(
        JSON.stringify({
          choices: [
            {
              message,
              finish_reason: message.tool_calls ? "tool_calls" : "stop",
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 20 },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
  );
  try {
    const events: unknown[] = [];
    const trace = await runAgent(
      "traditional",
      "Test fixture prompt: inspect flight data",
      10,
      (e) => events.push(e),
    );
    assert.equal(trace.status, "complete", trace.error);
    assert.equal(trace.metrics.modelRequests, 5);
    assert.equal(trace.metrics.toolCalls, 3);
    assert.equal(trace.metrics.inputTokens, 300);
    assert.equal(trace.metrics.outputTokens, 60);
    assert.equal(trace.metrics.usageSource, "provider");
    assert.ok(trace.metrics.intermediateBytes > 0);
    assert.equal(seen.length, 5);
    assert.ok(events.length > 10);
  } finally {
    f.mock.restore();
    if (savedKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = savedKey;
    if (savedModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = savedModel;
  }
});

test('conference result validation rejects a fare analysis that misses the warehouse result',async()=>{
 const {mainResultError}=await import('./validation.js');const {emptyMetrics}=await import('./runner.js');const {MAIN_PROMPT}=await import('./types.js');const {expectedFareAnalysis}=await import('./exasol.js');
 const expected=expectedFareAnalysis();
 const trace={version:1 as const,runId:'test-only',mode:'code' as const,prompt:MAIN_PROMPT,catalogSize:10,model:'test-double',dataset:'fixture',recordedAt:new Date().toISOString(),status:'complete' as const,events:[],metrics:emptyMetrics(10),answer:{cheapestMonth:expected.cheapestMonth,airlines:expected.airlines}};
 assert.equal(mainResultError(trace),undefined);
 assert.match(mainResultError({...trace,answer:{cheapestMonth:'2026-11',airlines:expected.airlines}})||'',/validation failed/i);
 assert.match(mainResultError({...trace,answer:{cheapestMonth:expected.cheapestMonth,airlines:expected.airlines.map(a=>({...a,fare:1}))}})||'',/validation failed/i);
 assert.equal(mainResultError({...trace,prompt:'Show the cancellation policy'}),undefined);
});
