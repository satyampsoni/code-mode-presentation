"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Braces,
  Check,
  CircleDollarSign,
  Code2,
  Database,
  Github,
  Layers,
  LockKeyhole,
  Play,
  Search,
  ShieldCheck,
  Slack,
  Sparkles,
  Timer,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";
import {
  Connector,
  Node,
  Reveal,
  Terminal,
  CodeEditor,
  ToolGrid,
  Metric,
} from "./visuals";
import { workflow } from "../lib/slides";
const adoptionScreenshots = [
  {
    image: "/claude-code-mode-announcement.png",
    alt: "ClaudeDevs announces experimental Code Mode in Claude Code: Claude writes scripts that chain tool calls together.",
    caption: "ClaudeDevs · Code Mode in Claude Code",
    href: "https://x.com/ClaudeDevs/status/2122801681939234950",
  },
  {
    image: "/claude-code-mode-ravve-jay.png",
    alt: "Ravve Jay says he tried Code Mode in the Claude Code terminal and found the savings impressive.",
    caption: "Ravve Jay · Firsthand reaction",
    href: "https://x.com/RJPrevendido/status/2124073641730338843",
  },
  {
    image: "/claude-code-mode-dheeraj-cost.png",
    alt: "Dheeraj Agrawal reports the same repository task costing $0.36 with Code Mode and $0.55 without it, with the same answers.",
    caption: "Dheeraj Agrawal · User-reported cost comparison",
    href: "",
  },
  {
    image: "/code-mode-harness-adoption.png",
    alt: "Kenton Varda reflects on Code Mode adoption across major agent harnesses, quoting Dane Knecht and Goose.",
    caption: "Kenton Varda · Adoption across harnesses",
    href: "https://x.com/KentonVarda/status/2122813445645189234",
  },
];
export function SlideContent({ index }: { index: number }) {
  if (index === 8) {
    const screenshot = adoptionScreenshots[0];
    return (
      <figure className="announcement-slide">
        <img src={screenshot.image} alt={screenshot.alt} />
        <figcaption>
          {screenshot.href ? (
            <a href={screenshot.href} target="_blank" rel="noreferrer">
              {screenshot.caption} ↗
            </a>
          ) : screenshot.caption}
        </figcaption>
      </figure>
    );
  }
  if (index === 9) return <AdoptionGallery />;
  if (index === 0)
    return (
      <div className="title-slide title-centered">
        <div className="nitrostack-title-brand">
          <img
            src="/nitrostack-logo.png"
            alt="NitroStack logo"
            width={104}
            height={104}
          />
          <span>NitroStack</span>
        </div>
        <h1>
          Solving the agent
          <br />
          integration layer
          <br />
          for <span>enterprise AI.</span>
        </h1>
        <p>From tool calling to programmable agent execution</p>
      </div>
    );
  if (index === 1)
    return (
      <>
        <p className="lede">Intelligence is only useful when it can act.</p>
        <div className="hands-diagram">
          <Reveal>
            <div className="isolated">
              <Node title="Language model" sub="Reasoning & intent" />
              <span className="boundary-label">THE MODEL</span>
            </div>
          </Reveal>
          <Connector />
          <Reveal delay={0.5}>
            <Node
              title="MCP"
              sub="A shared protocol"
              tone="blue"
              icon="network"
            />
          </Reveal>
          <Connector delay={0.7} />
          <div className="services">
            {["GitHub", "Slack", "Databases", "Enterprise APIs"].map((s, i) => (
              <Reveal delay={0.9 + i * 0.15} key={s}>
                <div className="service">
                  <span>
                    {i === 0 ? (
                      <Github />
                    ) : i === 1 ? (
                      <Slack />
                    ) : i === 2 ? (
                      <Database />
                    ) : (
                      <Braces />
                    )}
                  </span>
                  {s}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="three-primitives">
          {[
            [Zap, "Tools", "Perform actions."],
            [Database, "Resources", "Access data."],
            [Braces, "Prompts", "Reusable instructions."],
          ].map(([Icon, title, copy]) => (
            <div key={String(title)}>
              <span className={title === "Tools" ? "blue-text" : ""}>
                {typeof Icon !== "string" && <Icon size={24} />}
              </span>
              <strong>{String(title)}</strong>
              <p>{String(copy)}</p>
            </div>
          ))}
        </div>
      </>
    );
  if (index === 2)
    return (
      <>
        <div className="split discovery">
          <div>
            <div className="small-flow">
              <Node title="Claude Code" icon="terminal" />
              <Connector />
              <Node title="Travel MCP" tone="blue" icon="network" />
            </div>
            <Terminal title="claude-code — travel-mcp">
              <p>
                <span className="terminal-green">❯</span> Discover the available
                travel tools
              </p>
              <p className="terminal-muted">MCP request · tools/list</p>
              {[
                "search_flights",
                "compare_fares",
                "check_availability",
                "search_hotels",
                "get_booking_status",
              ].map((s, i) => (
                <Reveal delay={i * 0.2} key={s}>
                  <div className="tool-terminal-row">
                    <Check size={16} />
                    <span>{s}</span>
                    <small>ready</small>
                  </div>
                </Reveal>
              ))}
            </Terminal>
          </div>
          <CodeEditor
            title="tool.schema.json"
            code={
              '{\n  "name": "search_flights",\n  "description": "Find flights by route",\n  "inputSchema": {\n    "type": "object",\n    "properties": {\n      "from": { "type": "string" },\n      "to": { "type": "string" }\n    },\n    "required": ["from", "to"]\n  }\n}'
            }
          />
        </div>
        <div className="catalogs">
          {[5, 100, 1000].map((n, i) => (
            <div key={n}>
              <div className="catalog-label">
                <strong>{n.toLocaleString()} tools</strong>
                <span>
                  {
                    [
                      "A helpful assistant",
                      "A growing platform",
                      "An enterprise catalog",
                    ][i]
                  }
                </span>
              </div>
              <ToolGrid
                count={n === 1000 ? 200 : n}
                tone={i === 0 ? "green" : i === 1 ? "slate" : "amber"}
              />
              {n === 1000 && <small>Each cell represents 5 tools</small>}
            </div>
          ))}
        </div>
        <a className="text-link" href="/demo">
          D · Claude Code demo handoff <ArrowUpRight size={16} />
        </a>
      </>
    );
  if (index === 3) return <ContextSimulator />;
  if (index === 5)
    return (
      <figure className="announcement-slide">
        <img
          src="/kenton-varda-code-mode-announcement.png"
          alt="Kenton Varda's September 26, 2025 Code Mode announcement: convert MCP tools into a TypeScript API and have the agent write code against it, using Dynamic Worker Loading."
        />
        <figcaption>
          <a href="https://x.com/KentonVarda/status/1971564015282421909" target="_blank" rel="noreferrer">
            Kenton Varda · September 26, 2025 · Original announcement ↗
          </a>
        </figcaption>
      </figure>
    );
  if (index === 4)
    return (
      <>
        <p className="lede">Change the interface. Keep the capabilities.</p>
        <div className="comparison-panels">
          <div className="panel">
            <div className="panel-label">
              <span className="dot amber" />
              TRADITIONAL MCP
            </div>
            <div className="fan-diagram">
              <Node title="Language model" />
              <Connector tone="amber" />
              <div className="mini-tools">
                {[
                  "search_flights",
                  "compare_fares",
                  "check_baggage",
                  "search_hotels",
                ].map((s, i) => (
                  <Reveal delay={i * 0.18} key={s}>
                    <span>
                      {s}
                      <Braces size={17} />
                    </span>
                  </Reveal>
                ))}
              </div>
            </div>
            <p className="panel-caption">Every tool described to the model.</p>
          </div>
          <div className="panel code-panel">
            <div className="panel-label">
              <span className="dot purple" />
              CODE MODE
            </div>
            <div className="code-architecture">
              <Node title="LLM" />
              <Connector />
              <Node title="Execute" tone="purple" icon="code" />
              <Connector tone="cyan" />
              <Node title="Typed SDK" tone="cyan" icon="box" />
            </div>
            <div className="capability-strip">
              <Layers size={18} /> The same underlying tools
            </div>
            <p className="panel-caption">
              One execution interface. Programmable orchestration.
            </p>
          </div>
        </div>
        <div className="schema-transform">
          <div>
            <span className="eyebrow">FROM SCHEMA TO INTERFACE</span>
            <pre className="schema-before amber-text">
              {
                '{ "name": "search_flights",\n  "inputSchema": { "type": "object",\n    "properties": { "from": {"type":"string"},\n                    "to": {"type":"string"} } } }'
              }
            </pre>
            <code className="cyan-text">
              {"→ searchFlights(from: string, to: string)"}
            </code>
          </div>
          <CodeEditor
            title="generated-workflow.ts"
            code={
              'const flights = await travel.searchFlights("BLR", "SYD");\nreturn flights.sort((a, b) => a.price - b.price)[0];'
            }
          />
        </div>
        <p className="footnote">
          Compact types help. Large catalogs still need selective discovery.
        </p>
      </>
    );
  if (index === 6) return <ExecutionComparison />;
  if (index === 7) return <Anatomy />;
  if (index === 10) return <Workflow />;
  if (index === 11) return <Discovery />;
  if (index === 12) return <Sandbox />;
  if (index === 13)
    return (
      <>
        <div className="comparison-table">
          <div className="table-row table-head">
            <span>DIMENSION</span>
            <span>
              <span className="dot amber" /> Traditional MCP
            </span>
            <span>
              <span className="dot purple" /> Code Mode
            </span>
          </div>
          {[
            ["Tool discovery", "Often upfront", "On demand"],
            ["Context", "Full tool schemas", "Selected schemas"],
            [
              "Multi-step workflows",
              "Repeated model interactions",
              "Script execution",
            ],
            [
              "Intermediate data",
              "Often returned to model",
              "Processed in runtime",
            ],
            ["API coverage", "Often curated", "Broader catalogs possible"],
            ["Orchestration", "Model-driven", "Generated executable logic"],
          ].map((row, i) => (
            <Reveal delay={i * 0.23} key={row[0]}>
              <div className="table-row">
                {row.map((cell, j) => (
                  <span key={cell} className={j === 2 ? "purple-text" : ""}>
                    {cell}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
        <p className="footnote">
          Common architectural patterns; selective discovery is also possible
          with MCP.
        </p>
        <div className="closing-question">
          How difficult is it to actually build?
        </div>
      </>
    );
  if (index === 14)
    return (
      <>
        <div className="nitro-layout">
          <div>
            <p className="lede">The architecture, made executable.</p>
            <div className="nitro-architecture">
              <Node title="Claude Code" sub="The agent" icon="terminal" />
              <Connector />
              <Node
                title="NitroStack MCP Server"
                sub="Discovery + execution interfaces"
                tone="blue"
                icon="network"
              />
              <Connector tone="purple" />
              <Node
                title="Sandboxed JavaScript"
                sub="Generated workflow"
                tone="purple"
                icon="code"
              />
            </div>
            <div className="nitro-tools">
              {["Flights", "Pricing", "Baggage"].map((s) => (
                <Node key={s} title={s} tone="green" icon="box" />
              ))}
            </div>
          </div>
          <div className="demo-card">
            <span className="eyebrow">LET’S BUILD IT</span>
            <div className="demo-icon">
              <TerminalIcon />
            </div>
            <h3>
              Less plumbing.
              <br />
              More capability.
            </h3>
            <p>Discover. Generate. Execute.</p>
            <a href="/demo" className="primary-button">
              <Play size={19} fill="currentColor" /> Launch Live Demo
            </a>
            <span className="demo-time">04:45 · Live walkthrough</span>
          </div>
        </div>
        <p className="footnote">
          Conceptual integration architecture. Live demo implementation is
          prepared separately.
        </p>
      </>
    );
  return (
    <div className="closing-slide">
      <span className="eyebrow">THE TAKEAWAY</span>
      <Reveal>
        <p>MCP gave agents hands.</p>
      </Reveal>
      <Reveal delay={1}>
        <p>
          Code Mode gives them
          <br />a programmable interface.
        </p>
      </Reveal>
      <Reveal delay={2}>
        <h1>
          Enterprise AI needs <span>both.</span>
        </h1>
      </Reveal>
      <div className="closing-signature">
        Satyam Soni <span>Thank you.</span>
      </div>
    </div>
  );
}
function TerminalIcon() {
  return <Code2 size={42} strokeWidth={1.4} />;
}
function AdoptionGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const stories = [
    { label: "First reaction", title: "“Absolutely insane” savings.", author: "Ravve Jay", detail: "After trying Code Mode in Claude Code.", className: "reaction" },
    { label: "Reported savings", title: "34% cheaper on one task.", author: "Dheeraj Agrawal", detail: "$0.36 with Code Mode · $0.55 without", className: "cost" },
    { label: "Industry adoption", title: "A pattern across harnesses.", author: "Kenton Varda", detail: "Reflecting on a year of Code Mode adoption.", className: "adoption" },
  ];
  const active = selected === null ? null : adoptionScreenshots[selected + 1];
  return (
    <section className="adoption-gallery">
      <header className="adoption-heading">
        <span>ADOPTION & REACTIONS</span>
        <h2>From an idea to <em>real use.</em></h2>
        <p>Developers are trying it. The pattern is spreading.</p>
      </header>
      <div className="adoption-cards">
        {stories.map((story, i) => {
          const screenshot = adoptionScreenshots[i + 1];
          return (
            <article className={`adoption-card ${story.className}`} key={story.author}>
              <div className="adoption-card-label"><i />{story.label}</div>
              <button className="adoption-image-window" onClick={() => setSelected(i)} aria-label={`View full screenshot from ${story.author}`}>
                <img src={screenshot.image} alt={screenshot.alt} />
                <span className="adoption-expand"><ArrowUpRight size={15} /> View full post</span>
              </button>
              <div className="adoption-card-copy">
                <h3>{story.title}</h3>
                <p>{story.detail}</p>
                <div className="adoption-author"><span>{story.author}</span><span>{i === 1 ? "User-reported comparison" : "X / Twitter"}</span></div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="adoption-gallery-note">Three perspectives. One shift toward programmable tool use.</p>
      {active && (
        <div className="adoption-lightbox" role="dialog" aria-modal="true" aria-label={active.caption}
          onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}
          onKeyDown={(event) => { event.stopPropagation(); if (event.key === "Escape") setSelected(null); }}>
          <button className="adoption-lightbox-close" autoFocus onClick={() => setSelected(null)} aria-label="Close full screenshot"><X size={22} /></button>
          <img src={active.image} alt={active.alt} />
          <span>{active.caption}</span>
        </div>
      )}
    </section>
  );
}
function ContextSimulator() {
  const [tools, setTools] = useState(500);
  const tokens = tools * 200,
    remaining = Math.max(0, 200000 - 20000 - tokens),
    overflow = Math.max(0, 20000 + tokens - 200000);
  return (
    <>
      <div className="simulator-top">
        <p className="lede">Tool definitions compete with the work itself.</p>
        <span className="pill">200,000 token window</span>
      </div>
      <div className="sim-controls">
        <span>TOOLS IN CATALOG</span>
        {[10, 100, 500, 1000].map((n) => (
          <button
            key={n}
            aria-pressed={n === tools}
            className={n === tools ? "selected" : ""}
            onClick={() => setTools(n)}
          >
            {n.toLocaleString()}
          </button>
        ))}
      </div>
      <div className="context-bar">
        <div className="context-system" style={{ width: "10%" }}>
          20k
        </div>
        <div
          className="context-tools"
          style={{ width: `${Math.min(tokens, 180000) / 2000}%` }}
        >
          {tokens >= 20000 ? `${tokens / 1000}k` : ""}
        </div>
        {remaining > 0 && <div className="context-free" style={{ flex: 1 }} />}
        {overflow > 0 && (
          <div className="overflow-indicator">+{overflow / 1000}k overflow</div>
        )}
      </div>
      <div className="legend">
        <span>
          <i className="slate" />
          Conversation & instructions
        </span>
        <span>
          <i className="amber" />
          Tool definitions
        </span>
        <span>
          <i className="neutral" />
          Remaining context
        </span>
        {overflow > 0 && (
          <span className="red-text">
            <i className="red" />
            Overflow
          </span>
        )}
      </div>
      <div className="metrics">
        <Metric
          value={tokens.toLocaleString()}
          label="tool definition tokens"
          tone="amber"
        />
        <Metric
          value={remaining.toLocaleString()}
          label="tokens remaining"
          tone="slate"
        />
        <Metric
          value={overflow.toLocaleString()}
          label="tokens over capacity"
          tone={overflow ? "red" : "slate"}
        />
      </div>
      <div className="consequences">
        {[
          [CircleDollarSign, "Higher inference cost"],
          [TriangleAlert, "Potential accuracy degradation"],
          [Layers, "Context overflow"],
        ].map(([Icon, label]) => (
          <span key={String(label)}>
            {typeof Icon !== "string" && <Icon size={23} />} {String(label)}
          </span>
        ))}
      </div>
      <p className="footnote">
        Illustrative assumptions: 20,000 conversation tokens + 200 tokens per
        tool. Dynamic tool toggling can constrain agent autonomy.
      </p>
      <div className="closing-question">
        Can we reduce context without reducing capabilities?
      </div>
    </>
  );
}
function ExecutionComparison() {
  const [step, setStep] = useState(0),
    [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () =>
        setStep((s) => {
          if (s >= 7) {
            setRunning(false);
            return s;
          }
          return s + 1;
        }),
      850,
    );
    return () => clearInterval(id);
  }, [running]);
  return (
    <>
      <div className="prompt">
        <span>USER REQUEST</span>“Find the cheapest available flight from
        Bengaluru to Sydney and check its baggage allowance.”
      </div>
      <div className="flow-panels">
        <div className="panel">
          <div className="panel-label amber-text">TRADITIONAL MCP</div>
          <div className="traditional-flow">
            {[
              "LLM",
              "Search flights",
              "LLM",
              "Compare fares",
              "LLM",
              "Check baggage",
              "LLM",
              "Final answer",
            ].map((s, i) => (
              <div
                className={`flow-step ${step >= i ? "lit" : ""} ${s === "LLM" ? "model-step" : ""}`}
                key={i}
              >
                <span>
                  {s === "LLM" ? <Sparkles size={17} /> : <Braces size={17} />}
                </span>
                {s}
                {i < 7 && <span className="flow-line" />}
              </div>
            ))}
          </div>
          <div className="metric-pair">
            <Metric
              value={Math.min(4, Math.floor(step / 2) + 1)}
              label="model turns"
              tone="amber"
            />
            <Metric
              value={Math.min(3, Math.floor((step + 1) / 2))}
              label="tool calls"
            />
          </div>
        </div>
        <div className="panel code-panel">
          <div className="panel-label purple-text">CODE MODE</div>
          <div className="runtime-flow">
            <div
              className={step >= 0 ? "flow-step lit model-step" : "flow-step"}
            >
              <Sparkles size={18} /> LLM generates code
            </div>
            <Connector vertical tone="purple" />
            <div className={`runtime-box ${step >= 2 ? "lit" : ""}`}>
              <span className="eyebrow">EXECUTION ENVIRONMENT</span>
              <p>search → sort → baggage → filter</p>
              <span>Intermediate data stays here.</span>
            </div>
            <Connector vertical tone="purple" />
            <div className={`flow-step ${step >= 7 ? "lit" : ""}`}>
              <Check size={18} /> Final result → LLM
            </div>
          </div>
          <div className="metric-pair">
            <Metric
              value={step >= 7 ? 2 : 1}
              label="model turns"
              tone="purple"
            />
            <Metric
              value={Math.min(3, Math.max(0, step - 1))}
              label="tool calls"
            />
          </div>
        </div>
      </div>
      <div className="play-row">
        <button
          className="subtle-button"
          onClick={() => {
            setStep(0);
            setRunning(true);
          }}
        >
          <Play size={17} /> {running ? "Restart flow" : "Play execution"}
        </button>
        <span>
          Code Mode adds the logic to automate the back-and-forth work.
        </span>
      </div>
    </>
  );
}
const anatomy = [
  ["User request", "Intent enters the agent.", "slate"],
  [
    "Language model",
    "Generates executable logic using discovered types.",
    "slate",
  ],
  [
    "Sandboxed runtime",
    "Executes code; holds intermediate state with resource limits.",
    "purple",
  ],
  [
    "Generated SDK / tool bindings",
    "Typed bindings translate calls into authorized service requests.",
    "cyan",
  ],
  [
    "MCP tools · REST APIs · Enterprise services",
    "Underlying capabilities execute operations; results are serialized back to the model.",
    "green",
  ],
] as const;
function Anatomy() {
  const [selected, setSelected] = useState(2);
  return (
    <div className="anatomy">
      <div className="anatomy-stack">
        {anatomy.map((a, i) => (
          <Reveal delay={i * 0.28} key={a[0]}>
            <Node
              title={a[0]}
              tone={a[2]}
              icon={["box", "cpu", "code", "box", "network"][i]}
              onClick={() => setSelected(i)}
            />
            {i < 4 && <Connector vertical tone={i > 0 ? "purple" : "blue"} />}
          </Reveal>
        ))}
      </div>
      <div className="anatomy-detail">
        <span className="eyebrow">INSPECT THE ARCHITECTURE</span>
        <div className="detail-number">0{selected + 1}</div>
        <h3>{anatomy[selected][0]}</h3>
        <p>{anatomy[selected][1]}</p>
        <div className="detail-tip">Click a layer to explore its role.</div>
        <div className="result-note">
          <Braces size={22} />
          <span>
            Code out.
            <br />A compact, serialized result back.
          </span>
        </div>
      </div>
    </div>
  );
}
function Workflow() {
  const [step, setStep] = useState(-1),
    [running, setRunning] = useState(false);
  const lines = [0, 1, 2, 3, 5, 6, 7, 9, 10, 11, 13];
  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () =>
        setStep((s) => {
          if (s >= lines.length - 1) {
            setRunning(false);
            return s;
          }
          return s + 1;
        }),
      550,
    );
    return () => clearInterval(id);
  }, [running, lines.length]);
  return (
    <>
      <div className="workflow-layout">
        <CodeEditor code={workflow} active={lines[step]} />
        <div className="trace">
          <div className="trace-title">
            <span className="dot green" />
            EXECUTION TRACE<span>Illustrative</span>
          </div>
          {[
            ["searchFlights()", "BLR → SYD · 24 flights", 0],
            ["sort by price", "24 flights → cheapest option", 4],
            ["getBaggagePolicy()", "Flight AI-308 · 30 kg checked", 7],
            ["return result", "{ flight, baggage }", 10],
          ].map(([name, desc, threshold]) => (
            <div
              className={`trace-item ${step >= Number(threshold) ? "done" : ""}`}
              key={String(name)}
            >
              <span>
                {step >= Number(threshold) ? (
                  <Check size={19} />
                ) : (
                  <span className="trace-empty" />
                )}
              </span>
              <div>
                <strong>{name}</strong>
                <p>{desc}</p>
              </div>
            </div>
          ))}
          <button
            className="subtle-button"
            onClick={() => {
              setStep(-1);
              setRunning(true);
            }}
          >
            <Play size={16} /> {running ? "Restart execution" : "Run workflow"}
          </button>
        </div>
      </div>
      <div className="capability-tags">
        {[
          "Loops",
          "Conditions",
          "Parallel execution",
          "Filtering",
          "Transformations",
          "Dependent operations",
        ].map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <p className="core-message">
        The model generates the logic.{" "}
        <span>The runtime performs the computation.</span>
      </p>
    </>
  );
}
const discoveryDomains = [
  ["flights", "Flight search, fares, airlines and airports", "travel aviation route ticket"],
  ["hotels", "Hotel rooms, stays and reservations", "travel accommodation booking"],
  ["payments", "Payments, invoices and refunds", "billing finance money"],
  ["customers", "Customer profiles and accounts", "crm contact support"],
  ["inventory", "Inventory, products and stock", "warehouse catalog item"],
  ["shipments", "Shipments, delivery and tracking", "logistics shipping parcel"],
  ["events", "Calendar events and meetings", "schedule appointment time"],
  ["documents", "Documents, files and permissions", "storage content access"],
  ["reports", "Reports, metrics and dashboards", "analytics data insights"],
  ["employees", "Employees, teams and roles", "hr people staff"],
];
const discoveryActions = [
  "search", "get", "list", "create", "update", "cancel", "compare", "validate",
  "check_availability", "get_status", "get_history", "get_details", "get_policy",
  "get_price", "get_summary", "get_categories", "get_locations", "get_options",
  "get_recommendations", "get_rules", "get_limits", "get_metadata", "get_changes",
  "get_statistics", "get_related", "get_owner", "get_permissions", "get_schedule",
  "get_notifications", "get_audit_log",
];
const discoveryCatalog = discoveryDomains.flatMap(([domain, description, aliases]) =>
  discoveryActions.map((action, index) => ({
    name: domain === "flights" && index === 12
      ? "get_baggage_policy"
      : `${action}_${domain}`,
    description: domain === "flights" && index === 12
      ? "Checked baggage allowance, cabin bags and weight limits"
      : `${action.replaceAll("_", " ")} · ${description}`,
    aliases,
  })),
);
function Discovery() {
  const [query, setQuery] = useState("");
  const terms = query.toLowerCase().replace(/[-_]/g, " ").split(/\s+/)
    .filter((term) => term && !["find", "related", "capabilities", "tools", "the", "for", "and"].includes(term));
  const searching = query.trim().length > 0;
  const results = discoveryCatalog.filter((tool) => terms.every((term) =>
    `${tool.name.replaceAll("_", " ")} ${tool.description} ${tool.aliases}`.toLowerCase().includes(term),
  ));
  return (
    <>
      <p className="lede">A large catalog. A small context footprint.</p>
      <div className="discovery-interfaces">
        <Node title="AI agent" icon="cpu" />
        <Connector />
        <div className="interface-group">
          {[
            ["search", "Find capabilities"],
            ["get_schema", "Load selected types"],
            ["execute", "Run the workflow"],
          ].map(([title, sub], i) => (
            <Node
              key={title}
              title={title}
              sub={sub}
              tone={(["blue", "cyan", "purple"] as const)[i]}
              icon={i === 2 ? "code" : "box"}
            />
          ))}
        </div>
      </div>
      <div className="search-catalog">
        <form className="search-input" onSubmit={(event) => event.preventDefault()}>
          <Search size={23} />
          <input
            type="search"
            aria-label="Search capability catalog"
            placeholder="Search capabilities: flights, baggage, payments…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {searching && <button type="button" onClick={() => setQuery("")}>Reset</button>}
          <button type="submit">Search</button>
        </form>
        <div className="catalog-box">
          {searching ? (
            <div className="capability-results" aria-label="Matching capabilities">
              {results.length ? results.map((tool) => (
                <div className="capability-result" key={tool.name}>
                  <code>{tool.name}</code>
                  <span>{tool.description}</span>
                </div>
              )) : <p className="catalog-empty">No capabilities match “{query}”. Try flights, baggage, hotels or payments.</p>}
            </div>
          ) : <ToolGrid count={300} />}
          <div className="catalog-bottom" role="status" aria-live="polite">
            <span>Enterprise capability catalog · 300 illustrative tools</span>
            <strong className={searching && results.length ? "green-text" : ""}>
              {searching
                ? `${results.length} matching ${results.length === 1 ? "capability" : "capabilities"} · 0 schemas loaded`
                : "0 schemas loaded upfront"}
            </strong>
          </div>
        </div>
      </div>
      <div className="discovery-stages">
        <span>
          01 <b>Search the catalog</b>
        </span>
        <span>
          02 <b>Load relevant schemas</b>
        </span>
        <span>
          03 <b>Execute with typed bindings</b>
        </span>
      </div>
      <p className="footnote">
        Illustrative interface names. Discovery results must respect the
        caller’s permissions.
      </p>
    </>
  );
}
function Sandbox() {
  const [attempt, setAttempt] = useState(false);
  return (
    <>
      <p className="lede">
        Treat generated code as untrusted. Make execution controlled.
      </p>
      <div className="sandbox-layout">
        <div className="sandbox-input">
          <Code2 size={36} />
          <strong>
            AI-generated
            <br />
            JavaScript
          </strong>
          <code>await tools.call(...)</code>
        </div>
        <Connector tone="purple" />
        <div className="sandbox">
          <div className="sandbox-header">
            <ShieldCheck size={24} />
            <strong>ISOLATED SANDBOX</strong>
            <span>Trust boundary</span>
          </div>
          <div className="security-controls">
            {[
              [Database, "Memory limits", "Bounded allocation"],
              [Timer, "Execution timeouts", "Bounded runtime"],
              [LockKeyhole, "Tool permissions", "Scoped capabilities"],
              [Layers, "Tool-call limits", "Bounded operations"],
            ].map(([Icon, title, sub]) => (
              <div key={String(title)}>
                {typeof Icon !== "string" && <Icon size={23} />}
                <strong>{String(title)}</strong>
                <span>{String(sub)}</span>
              </div>
            ))}
          </div>
          <div className="audit-line">
            <span className="dot purple" />
            Isolate · Authorize · Audit
          </div>
        </div>
        <Connector tone={attempt ? "red" : "green"} />
        <div className="sandbox-outputs">
          <div className="authorized">
            <Check size={23} />
            <strong>travel.searchFlights</strong>
            <span>Authorized</span>
          </div>
          <div className={`unauthorized ${attempt ? "blocked" : ""}`}>
            <X size={23} />
            <strong>admin.deleteAll</strong>
            <span>
              {attempt ? "Blocked · permission denied" : "No permission"}
            </span>
          </div>
        </div>
      </div>
      <div className="security-bottom">
        <button className="subtle-button" onClick={() => setAttempt(!attempt)}>
          <ShieldCheck size={18} />
          {attempt ? "Reset request" : "Try unauthorized call"}
        </button>
        <p>
          Sandboxing does not replace{" "}
          <strong>authentication or authorization.</strong>
        </p>
      </div>
    </>
  );
}
