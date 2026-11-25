export const slides = [
  {
    title: "Solving the Agent Integration Layer for Enterprise AI",
    section: "The integration layer",
    duration: 0,
    notes:
      "Welcome. This is a 20-minute technical journey from tool calling to programmable agent execution. Start the timer when moving to slide 1.",
  },
  {
    title: "Giving AI agents hands",
    section: "The foundation",
    duration: 45,
    notes:
      "Anthropic introduced MCP in November 2024 to standardize connections between AI applications and external systems. Think of it as giving agents hands. Tools perform actions, resources expose data, and prompts provide reusable instructions. Today we focus on tools.",
  },
  {
    title: "MCP works. Until we scale.",
    section: "The scaling problem",
    duration: 60,
    notes:
      "Walk through tools/list. Clients make tool specifications available to the model; exact loading strategies differ by client. Five travel tools are easy to reason about. What happens when an enterprise exposes thousands of capabilities? Press D to open the demo handoff and switch to your prepared Claude Code terminal.",
  },
  {
    title: "The context window problem",
    section: "The scaling problem",
    duration: 75,
    notes:
      "These numbers are illustrative, not a measurement of any specific model. We assume 200k capacity, 20k conversation and 200 tokens per tool. Select 1,000 tools: definitions alone consume 200k tokens. Cost and accuracy depend on model, caching and tool selection. Dynamically enabling tools helps, but external selection can constrain agent autonomy. Can we reduce context without reducing capabilities?",
  },
  {
    title: "What if agents could write code instead?",
    section: "A different interface",
    duration: 90,
    notes:
      "The original Code Mode pattern generates TypeScript declarations or an SDK from tool specifications, then gives the model a code execution interface. The runtime still invokes the underlying capabilities. TypeScript is an interface for generation; the runtime executes JavaScript. Compact SDK types alone do not eliminate context limits. Large catalogs also need selective discovery.",
  },
  {
    title: "The original Code Mode announcement",
    section: "A different interface",
    duration: 30,
    notes:
      "Kenton Varda announced Code Mode on September 26, 2025: convert MCP tools into a TypeScript API and ask the agent to write code against it, using Dynamic Worker Loading. This is the original post screenshot supplied for the presentation.",
  },
  {
    title: "From tool calling to code execution",
    section: "A different interface",
    duration: 100,
    notes:
      "Keep the request identical in both flows. Traditional execution returns intermediate data to the model across dependent steps. Code Mode expresses the sequence in one script and returns a compact result. In this illustrative comparison there are four versus two model turns and three underlying tool calls on both sides. Sorting happens locally. Code Mode does not inherently reduce API calls.",
  },
  {
    title: "Anatomy of Code Mode",
    section: "Under the hood",
    duration: 100,
    notes:
      "Click each layer. The model generates logic. The isolated runtime executes it. Typed bindings translate calls into MCP or API requests. Intermediate state stays in runtime memory. Only a serialized result crosses back into model context. Tool services remain responsible for identity and authorization.",
  },
  {
    title: "Code Mode comes to Claude Code",
    section: "Code Mode in practice",
    duration: 15,
    notes: "Official ClaudeDevs announcement of experimental Code Mode. Explain that Claude writes scripts to compose tool calls.",
  },
  {
    title: "Code Mode: reactions and adoption",
    section: "Code Mode in practice",
    duration: 45,
    notes:
      "Three supplied screenshots together: Ravve Jay reports being impressed after trying Claude Code's Code Mode; Dheeraj Agrawal shares his own cost comparison; Kenton Varda reflects on adoption across harnesses. User-reported savings are specific to their examples.",
  },
  {
    title: "Code is a better interface\nfor complex workflows",
    section: "Under the hood",
    duration: 100,
    notes:
      "Play the execution trace. Search flights, sort by price, fetch baggage for the selected flight, and serialize the result. This is illustrative execution, not a real airline integration. Code provides familiar control flow: loops, conditions, parallel execution, filters, transforms and dependent operations. The model generates logic; the runtime performs computation.",
  },
  {
    title: "Discover capabilities.\nDon’t load everything.",
    section: "Under the hood",
    duration: 90,
    notes:
      "These are illustrative interface names, not mandated MCP methods. Search locates candidates; get_schema loads only needed contracts; execute runs the generated workflow. Progressive discovery supports broad catalogs while controlling context. Search quality and authorization filtering still matter.",
  },
  {
    title: "Can we trust AI-generated code?",
    section: "The trust boundary",
    duration: 90,
    notes:
      "Treat generated JavaScript as untrusted. Enforce memory budgets, execution timeouts, scoped tool permissions and tool-call budgets. Isolate runtime access and audit tool operations. Block unauthorized calls at the capability boundary. Sandboxing never replaces authentication or authorization. This diagram is a conceptual security model, not a functioning sandbox.",
  },
  {
    title: "Enterprise integration at scale",
    section: "Putting it together",
    duration: 60,
    notes:
      "These are common architectural tendencies, not protocol limitations. MCP can also support dynamic discovery and selective loading. Code Mode adds generated executable orchestration on top of capabilities. So far, we have discussed Code Mode as an architectural pattern. How difficult is it to actually build?",
  },
  {
    title: "Building Code Mode\nwith NitroStack",
    section: "From architecture to execution",
    duration: 285,
    notes:
      "Live demo agenda (4m45s): 0:00–0:45 scaffold the prepared NitroStack project; 0:45–1:30 enable Code Mode using the version-specific configuration; 1:30–2:15 connect Claude Code to the MCP server; 2:15–3:45 run the flight and baggage workflow; 3:45–4:45 compare discovery, model turns and intermediate data. The /demo route contains the working NitroStack 1.1.3 travel lab. Use the Build Mode tab and five-minute stage shortcuts to explain the actual files. Live runs use the configured OpenAI-compatible provider; genuine saved traces are available in explicitly labeled replay mode.",
  },
  {
    title: "Enterprise AI needs both.",
    section: "The takeaway",
    duration: 15,
    notes:
      "MCP gave agents hands. Code Mode gives them a programmable interface. Enterprise AI needs both. Thank you.",
  },
];
export const workflow = `const flights = await travel.searchFlights({\n  from: "BLR",\n  to: "SYD"\n});\n\nconst cheapest = flights.sort(\n  (a, b) => a.price - b.price\n)[0];\n\nconst baggage = await travel.getBaggagePolicy({\n  flightId: cheapest.id\n});\n\nreturn { flight: cheapest, baggage };`;
