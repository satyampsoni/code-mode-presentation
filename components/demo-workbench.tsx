"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Braces,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  FileCode2,
  GitCompareArrows,
  Layers,
  Loader2,
  Network,
  Moon,
  Play,
  Radio,
  RotateCcw,
  Sun,
  Search,
  ShieldCheck,
  Square,
  Terminal as TerminalIcon,
  TriangleAlert,
  X,
} from "lucide-react";
import { CodeEditor } from "./visuals";
import GrafanaDashboard from "./grafana-dashboard";
import type {
  Metrics,
  Mode,
  RunTrace,
  TraceEvent,
} from "../travel-lab/src/types";
import { MAIN_PROMPT } from "../travel-lab/src/types";
interface RecordingInfo {
  id: string;
  recordedAt: string;
  prompt: string;
  catalogSize: number;
  model: string;
  modes: Mode[];
}
interface Status {
  executionMode?: "live" | "recorded";
  providerConfigured: boolean;
  model: string | null;
  sdkVersion: string;
  recordings: RecordingInfo[];
  busy: boolean;
}
interface Sources {
  files: { path: string; code: string }[];
  commands: Record<string, string>;
}
type StreamMessage =
  | TraceEvent
  | {
      type:
        | "session.start"
        | "session.error"
        | "session.complete"
        | "session.replay";
      error?: string;
      traces?: RunTrace[];
      replay?: boolean;
      recordingId?: string;
      recording?: RecordingInfo;
    };
const stages = [
  {
    title: "The working tools",
    caption: "Inspect the travel server and tools",
    tab: "build",
    file: "travel-lab/src/travel.tools.ts",
  },
  {
    title: "One configuration change",
    caption: "Enable NitroStack’s real CodeModeTransform.",
    tab: "build",
    file: "travel-lab/src/app.module.ts",
  },
  {
    title: "A different tool surface",
    caption: "Connect Claude Code. Compare tools/list.",
    tab: "architecture",
    file: "travel-lab/src/mcp-client.ts",
  },
  {
    title: "Let the model write the workflow",
    caption: "Run the same prompt through both MCP configurations.",
    tab: "compare",
    file: "travel-lab/src/runner.ts",
  },
  {
    title: "Measure what happened",
    caption: "Inspect measured usage, tool calls and execution latency.",
    tab: "compare",
    file: "travel-lab/src/runner.ts",
  },
];
const modes: Mode[] = ["traditional", "code"];
const blankEvents = () => ({
  traditional: [] as TraceEvent[],
  code: [] as TraceEvent[],
});
const number = (n: number | undefined) =>
  n === undefined ? "—" : n.toLocaleString("en-IN");
export default function DemoWorkbench() {
  const [prompt, setPrompt] = useState(MAIN_PROMPT),
    [catalog, setCatalog] = useState(10),
    [tab, setTab] = useState("compare"),
    [stage, setStage] = useState(0),
    [status, setStatus] = useState<Status | null>(null),
    [source, setSource] = useState<Sources | null>(null),
    [activeFile, setActiveFile] = useState(stages[0].file),
    [events, setEvents] = useState(blankEvents),
    [metrics, setMetrics] = useState<Partial<Record<Mode, Metrics>>>({}),
    [traces, setTraces] = useState<Partial<Record<Mode, RunTrace>>>({}),
    [running, setRunning] = useState(false),
    [runningMode, setRunningMode] = useState<Mode | "both">("both"),
    [error, setError] = useState(""),
    [replay, setReplay] = useState(false),
    [recordingId, setRecordingId] = useState(""),
    [replayInfo, setReplayInfo] = useState<RecordingInfo | null>(null),
    [security, setSecurity] = useState<Record<string, unknown> | null>(null),
    [testing, setTesting] = useState(false),
    [inspected, setInspected] = useState<TraceEvent | null>(null),
    [copied, setCopied] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const themeRef = useRef(theme);
  const channel = useRef<BroadcastChannel | null>(null);
  themeRef.current = theme;
  const abort = useRef<AbortController | null>(null);
  const refreshStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/demo/status");
      const s = await r.json();
      if (!r.ok) throw new Error(s.error);
      setStatus(s);
      if (s.executionMode === "recorded") setReplay(true);
      setError("");
      setRecordingId((id) =>
        s.recordings.some(
          (r: RecordingInfo) =>
            r.id === id &&
            r.modes.includes("traditional") &&
            r.modes.includes("code"),
        )
          ? id
          : s.recordings.find(
              (r: RecordingInfo) =>
                r.modes.includes("traditional") && r.modes.includes("code"),
            )?.id || "",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);
  useEffect(() => {
    void refreshStatus();
    return () => abort.current?.abort();
  }, [refreshStatus]);
  useEffect(() => {
    if (tab !== "build" || source) return;
    fetch("/api/demo/sources")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setSource(data);
      })
      .catch((e) => setError(String(e)));
  }, [tab, source]);
  useEffect(() => {
    if (!replay || running) return;
    const selected = status?.recordings.find((item) => item.id === recordingId);
    if (selected) {
      setPrompt(selected.prompt);
      setCatalog(selected.catalogSize);
    }
  }, [replay, running, recordingId, status]);
  useEffect(() => {
    if (stage === 4 && tab === "compare")
      document
        .querySelector(".metrics-dashboard")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stage, tab]);
  const setMinute = useCallback((n: number) => {
    const s = Math.max(0, Math.min(4, n));
    setStage(s);
    setTab(stages[s].tab);
    setActiveFile(stages[s].file);
  }, []);
  const applyTheme = useCallback((next: "dark" | "light") => {
    themeRef.current = next;
    setTheme(next);
    try {
      localStorage.setItem("codemode-talk-theme", next);
    } catch {}
    channel.current?.postMessage({ type: "theme", theme: next });
  }, []);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("codemode-talk-theme");
      if (saved === "light" || saved === "dark") {
        themeRef.current = saved;
        setTheme(saved);
      }
    } catch {}
    const bc = new BroadcastChannel("codemode-talk");
    channel.current = bc;
    bc.onmessage = (e) => {
      if (e.data?.type !== "theme") return;
      if (e.data.theme !== "light" && e.data.theme !== "dark") return;
      themeRef.current = e.data.theme;
      setTheme(e.data.theme);
    };
    return () => {
      channel.current = null;
      bc.close();
    };
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).matches("input,textarea,select") ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return;
      if (/^[1-5]$/.test(e.key)) setMinute(Number(e.key) - 1);
      if (e.key === "]") setMinute(stage + 1);
      if (e.key === "[") setMinute(stage - 1);
      if (e.key === "Escape") setInspected(null);
      if (e.key.toLowerCase() === "b")
        applyTheme(themeRef.current === "dark" ? "light" : "dark");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setMinute, stage, applyTheme]);
  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setError("Clipboard unavailable. Select and copy the visible command.");
    }
  };
  const start = async (mode: Mode | "both") => {
    if (running) return;
    setRunning(true);
    setRunningMode(mode);
    setError("");
    if (replay && mode !== "both") {
      setEvents((s) => ({ ...s, [mode]: [] }));
      setMetrics((s) => ({ ...s, [mode]: undefined }));
      setTraces((s) => ({ ...s, [mode]: undefined }));
    } else {
      setEvents(blankEvents());
      setMetrics({});
      setTraces({});
    }
    setReplayInfo(null);
    abort.current = new AbortController();
    try {
      const r = await fetch(`/api/demo/${replay ? "replay" : "run"}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          replay
            ? { id: recordingId, mode }
            : { mode, prompt, catalogSize: catalog },
        ),
        signal: abort.current.signal,
      });
      if (!r.ok) {
        const body = await r.json();
        throw new Error(body.error || `HTTP ${r.status}`);
      }
      if (!r.body) throw new Error("Streaming response unavailable");
      const reader = r.body.getReader(),
        decoder = new TextDecoder();
      let pending = "";
      while (true) {
        const { value, done } = await reader.read();
        pending += decoder.decode(value, { stream: !done });
        let boundary;
        while ((boundary = pending.indexOf("\n\n")) >= 0) {
          const frame = pending.slice(0, boundary);
          pending = pending.slice(boundary + 2);
          const data = frame
            .split("\n")
            .filter((l) => l.startsWith("data: "))
            .map((l) => l.slice(6))
            .join("\n");
          if (!data) continue;
          const event = JSON.parse(data) as StreamMessage;
          if (event.type === "session.error")
            throw new Error((event as { error: string }).error);
          if (event.type === "session.replay") {
            const info = (event as { recording: RecordingInfo }).recording;
            setReplayInfo(info);
            setPrompt(info.prompt);
            setCatalog(info.catalogSize);
          }
          if (event.type === "session.complete") {
            const complete = event as {
              traces: RunTrace[];
              recordingId?: string;
            };
            for (const trace of complete.traces) {
              setTraces((s) => ({ ...s, [trace.mode]: trace }));
              setMetrics((s) => ({ ...s, [trace.mode]: trace.metrics }));
            }
            if (complete.recordingId) setRecordingId(complete.recordingId);
            void refreshStatus();
          }
          if ("mode" in event) {
            setEvents((s) => ({
              ...s,
              [event.mode]: [...s[event.mode], event],
            }));
            if (event.metrics)
              setMetrics((s) => ({ ...s, [event.mode]: event.metrics }));
          }
        }
        if (done) break;
      }
    } catch (e) {
      setError(
        e instanceof Error && e.name === "AbortError"
          ? "Run cancelled. No incomplete recording was saved."
          : e instanceof Error
            ? e.message
            : String(e),
      );
    } finally {
      setRunning(false);
      abort.current = null;
    }
  };
  const reset = () => {
    abort.current?.abort();
    setEvents(blankEvents());
    setMetrics({});
    setTraces({});
    setError("");
    setSecurity(null);
    setReplayInfo(null);
    setInspected(null);
  };
  const testSecurity = async () => {
    setTesting(true);
    setError("");
    setSecurity(null);
    try {
      const r = await fetch("/api/demo/security", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setSecurity(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setTesting(false);
    }
  };
  const complete = modes.every((m) => traces[m]?.status === "complete");
  return (
    <main className="lab-shell" data-theme={theme}>
      <header className="lab-header">
        <a className="brand nitrostack-lab-brand" href="/?slide=15">
          <img src="/nitrostack-logo.png" alt="" width={25} height={25} />
          <span>
            NitroStack <span className="brand-light"> / execution lab</span>
          </span>
        </a>
        <div className="lab-header-center">
          <span className="lab-version">NitroStack 1.1.3</span>
          <span>
            {status
              ? status.model || "Provider not configured"
              : "Connecting to local agent"}
          </span>
        </div>
        <div className="lab-header-actions">
          <button
            className="theme-switch"
            title={theme === "dark" ? "White theme (B)" : "Dark theme (B)"}
            aria-label={theme === "dark" ? "Switch to white theme" : "Switch to dark theme"}
            aria-pressed={theme === "dark"}
            onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a className="back-to-talk" href="/?slide=15">
            <ArrowLeft size={14} /> Back to the talk
          </a>
        </div>
      </header>
      <section className="lab-intro">
        <div>
          <h1>Tool calling and Code Mode</h1>
          <p className="lab-dek">Compare the same request against the same travel tools</p>
        </div>
        <div className="lab-mode-switch">
          <button
            className={!replay ? "active" : ""}
            disabled={running || status?.executionMode === "recorded"}
            onClick={() => {
              setReplay(false);
              reset();
            }}
          >
            <Radio size={14} />
            Live execution
          </button>
          <button
            className={replay ? "active" : ""}
            disabled={running}
            onClick={() => {
              setReplay(true);
              reset();
            }}
          >
            <RotateCcw size={14} />
            Replay
          </button>
        </div>
      </section>
      {replay && (
        <div className="replay-banner">
          <RotateCcw size={18} />
          <div>
            <strong>Replay</strong>
            <span>
              {replayInfo
                ? new Date(replayInfo.recordedAt).toLocaleString()
                : "Choose a saved run."}
            </span>
          </div>
          <select
            aria-label="Saved run"
            value={recordingId}
            onChange={(e) => setRecordingId(e.target.value)}
            disabled={running}
          >
            <option value="">
              {status?.recordings.length
                ? "Select a run"
                : "No saved runs yet"}
            </option>
            {status?.recordings
              .filter(
                (r) =>
                  r.modes.includes("traditional") && r.modes.includes("code"),
              )
              .map((r) => (
                <option value={r.id} key={r.id}>
                  {new Date(r.recordedAt).toLocaleString()}, {r.catalogSize}{" "}
                  tools, {r.modes.join(" + ")}
                </option>
              ))}
          </select>
        </div>
      )}
      <section className="lab-prompt">
        <div className="prompt-field">
          <label htmlFor="agent-prompt">
            Agent request{" "}
            <span>Editable natural language</span>
          </label>
          <textarea
            id="agent-prompt"
            rows={2}
            maxLength={6000}
            value={prompt}
            disabled={running || replay}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div className="lab-run-controls">
          <label>
            Tool catalog
            <select
              aria-label="Tool catalog size"
              value={catalog}
              disabled={running || replay}
              onChange={(e) => setCatalog(Number(e.target.value))}
            >
              {[10, 100, 1000].map((n) => (
                <option key={n} value={n}>
                  {n.toLocaleString()} capabilities
                </option>
              ))}
            </select>
            <ChevronDown size={13} />
          </label>
          <div className="run-buttons">
            {!replay && (
              <>
                <button
                  className="run-traditional"
                  disabled={running || !status || !prompt.trim()}
                  onClick={() => void start("traditional")}
                >
                  <Play size={14} />
                  Run Tool Calling
                </button>
                <button
                  className="run-code"
                  disabled={running || !status || !prompt.trim()}
                  onClick={() => void start("code")}
                >
                  <Code2 size={16} />
                  Run Code Mode
                </button>
              </>
            )}
            <button
              className="run-both"
              disabled={
                running || !status || (replay ? !recordingId : !prompt.trim())
              }
              onClick={() => void start("both")}
            >
              {running ? (
                <Loader2 size={15} className="spinning" />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
              {replay ? "Replay both modes" : "Run Both"}
            </button>
            {running ? (
              <button
                className="lab-reset"
                onClick={() => abort.current?.abort()}
              >
                <Square size={14} />
                Cancel
              </button>
            ) : (
              <button className="lab-reset" onClick={reset}>
                <RotateCcw size={14} />
                Reset
              </button>
            )}
          </div>
        </div>
      </section>
      {error && (
        <div className="lab-error" role="alert">
          <TriangleAlert size={17} />
          <span>{error}</span>
          <button onClick={() => void refreshStatus()}>Check connection</button>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}
      {!status?.providerConfigured && status && !replay && (
        <div className="configuration-note">
          <TerminalIcon size={15} />
          <span>
            Set <code>OPENAI_API_KEY</code> and <code>OPENAI_MODEL</code> in{" "}
            <code>.env.local</code>, then restart <code>npm run demo</code> to
            enable live model execution.
          </span>
        </div>
      )}
      <nav className="lab-tabs" aria-label="Demo views">
        {[
          ["compare", "Execution", GitCompareArrows],
          ["architecture", "Architecture", Network],
          ["build", "Build Mode", FileCode2],
        ].map(([id, label, Icon]) => (
          <button
            key={String(id)}
            aria-current={tab === id ? "page" : undefined}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(String(id))}
          >
            {typeof Icon !== "string" && <Icon size={16} />} {String(label)}
          </button>
        ))}
      </nav>
      {tab === "compare" && (
        <>
          <div className="execution-columns">
            {modes.map((mode) => (
              <ExecutionPanel
                key={mode}
                mode={mode}
                events={events[mode]}
                trace={traces[mode]}
                replay={replay}
                running={
                  running &&
                  (runningMode === "both" || runningMode === mode) &&
                  !traces[mode]
                }
                onReplay={() => void start(mode)}
                replayDisabled={running || !recordingId || !status}
                inspect={setInspected}
              />
            ))}
          </div>
          <MetricsComparison
            metrics={metrics}
            complete={complete}
            replay={replay}
          />
          <GrafanaDashboard recordingId={recordingId} />
        </>
      )}
      {tab === "architecture" && (
        <>
          <div className="architecture-columns">
            {modes.map((mode) => (
              <LiveArchitecture key={mode} mode={mode} events={events[mode]} />
            ))}
          </div>
          <div className="architecture-bottom">
            <div>
              <ShieldCheck size={21} />
              <h3>QuickJS execution limits</h3>
              <p>
                QuickJS WebAssembly, 64 MB heap, 2 second timeout, 40 tool
                calls per script
              </p>
              <span>
                Only registered capabilities. No Node.js globals. Sandboxing
                complements authentication and authorization.
              </span>
            </div>
            <button
              disabled={running || testing || !status || status.executionMode === "recorded"}
              onClick={() => void testSecurity()}
            >
              {testing ? (
                <Loader2 className="spinning" size={17} />
              ) : (
                <ShieldCheck size={17} />
              )}
              Test execution timeout
            </button>
          </div>
          {security && (
            <div
              className={`security-result ${security.blocked ? "blocked" : "not-blocked"}`}
            >
              <strong>
                {security.blocked
                  ? "Blocked by the sandbox"
                  : "Unexpected result. Inspect the response."}
              </strong>
              <span>
                {String(security.durationMs)} ms wall time. Configured timeout{" "}
                {String(security.timeoutMs)} ms
              </span>
              <code>while (true) {"{}"}</code>
              <pre>{JSON.stringify(security.result, null, 2)}</pre>
            </div>
          )}
          <div className="architecture-events">
            <span className="eyebrow">Recent execution events</span>
            {modes
              .flatMap((m) => events[m].slice(-5))
              .map((e) => (
                <button key={e.id} onClick={() => setInspected(e)}>
                  <span className={`event-dot ${e.mode}`} />
                  <span>{e.mode === "code" ? "Code Mode" : "Tool Calling"}</span>
                  <strong>{e.type}</strong>
                  <span>{e.name}</span>
                  <code>{new Date(e.timestamp).toLocaleTimeString()}</code>
                  <ChevronRight size={14} />
                </button>
              ))}
            {!events.traditional.length && !events.code.length && (
              <p>Run a workflow to inspect real MCP, model and tool events.</p>
            )}
          </div>
        </>
      )}
      {tab === "build" && (
        <div className="build-workspace">
          <aside>
            <span className="eyebrow">The working project</span>
            {source?.files.map((f) => (
              <button
                key={f.path}
                className={activeFile === f.path ? "selected" : ""}
                onClick={() => setActiveFile(f.path)}
              >
                <FileCode2 size={15} />
                {f.path.replace("travel-lab/", "")}
              </button>
            ))}
            <div className="build-source-note">
              These files are read from the running project.
            </div>
            <a
              href="https://docs.nitrostack.ai/docs/templates/code-mode"
              target="_blank"
              rel="noreferrer"
            >
              Official Code Mode documentation
            </a>
          </aside>
          <div className="build-main">
            {!source ? (
              <div className="lab-empty">
                <Loader2 className="spinning" />
                Loading project sources…
              </div>
            ) : (
              <>
                <div className="source-toolbar">
                  <span>{activeFile}</span>
                  <button
                    onClick={() =>
                      void copy(
                        source.files.find((f) => f.path === activeFile)?.code ||
                          "",
                        activeFile,
                      )
                    }
                  >
                    {copied === activeFile ? (
                      <Check size={15} />
                    ) : (
                      <Copy size={15} />
                    )}
                    Copy file
                  </button>
                </div>
                <div className="build-editor">
                  <CodeEditor
                    title={activeFile.split("/").pop()}
                    code={
                      source.files.find((f) => f.path === activeFile)?.code ||
                      ""
                    }
                  />
                </div>
                {activeFile.endsWith("app.module.ts") && (
                  <div className="config-diff">
                    <div>
                      <span className="amber-text">Tool Calling</span>
                      <pre>
                        TRAVEL_MODE=traditional
                        <br />
                        {"transforms: []"}
                      </pre>
                    </div>
                    <div>
                      <span className="purple-text">Code Mode</span>
                      <pre>
                        TRAVEL_MODE=code
                        <br />
                        {"transforms: [new CodeModeTransform(sandboxOptions)]"}
                      </pre>
                    </div>
                  </div>
                )}
                <div className="build-commands">
                  <span className="eyebrow">Walkthrough commands</span>
                  {Object.entries(source.commands).map(([name, command]) => (
                    <div key={name}>
                      <span>{name}</span>
                      <code>{command}</code>
                      <button
                        aria-label={`Copy ${name} command`}
                        onClick={() => void copy(command, name)}
                      >
                        {copied === name ? (
                          <Check size={15} />
                        ) : (
                          <Copy size={15} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <footer className="presenter-stages">
        <div>
          <span className="stage-caption">Five-minute walkthrough</span>
          <div>
            {stages.map((s, i) => (
              <button
                aria-label={`Minute ${i + 1}: ${s.title}`}
                key={s.title}
                onClick={() => setMinute(i)}
                className={stage === i ? "active" : ""}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <section>
          <strong>{stages[stage].title}</strong>
          <span>{stages[stage].caption}</span>
        </section>
        <span className="stage-key-hint">
          <kbd>[</kbd>
          <kbd>]</kbd> change stage, <kbd>1–5</kbd> jump
        </span>
        <button
          disabled={stage === 4}
          aria-label="Next presenter stage"
          onClick={() => setMinute(stage + 1)}
        >
          <ArrowRight size={18} />
        </button>
      </footer>
      <AnimatePresence>
        {inspected && (
          <motion.div
            className="event-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspected(null)}
          >
            <section
              className="event-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Event inspector"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <span className="eyebrow">
                  {inspected.mode === "code" ? "Code Mode" : "Tool Calling"}. {inspected.type}
                </span>
                <button
                  aria-label="Close event inspector"
                  onClick={() => setInspected(null)}
                >
                  <X size={21} />
                </button>
              </div>
              <h3>{inspected.name}</h3>
              <p>
                {inspected.timestamp}
                {inspected.durationMs !== undefined
                  ? `, ${inspected.durationMs.toFixed(1)} ms`
                  : ""}
              </p>
              <pre>{JSON.stringify(inspected.payload, null, 2)}</pre>
              <span>
                Credentials and sensitive headers are redacted server-side.
              </span>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
function ExecutionPanel({
  mode,
  events,
  trace,
  replay,
  running,
  onReplay,
  replayDisabled,
  inspect,
}: {
  mode: Mode;
  events: TraceEvent[];
  trace?: RunTrace;
  replay: boolean;
  running: boolean;
  onReplay: () => void;
  replayDisabled: boolean;
  inspect: (e: TraceEvent) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [following, setFollowing] = useState(true);
  useEffect(() => {
    if (following && scroller.current)
      scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [events.length, trace, following]);
  const code = events.filter((e) => e.type === "code.generated").at(-1)
    ?.payload as { code?: string } | undefined;
  const hasStarted = events.length > 0;
  const answer = trace?.answer as
    | {
        options?: {
          id?: string;
          flightId?: string;
          airline?: string;
          price?: number;
          checkedKg?: number;
        }[];
        explanation?: string;
      }
    | undefined;
  return (
    <section className={`execution-panel ${mode}`}>
      <header>
        <div className="execution-symbol">
          {mode === "traditional" ? <Network size={20} /> : <Code2 size={21} />}
        </div>
        <div>
          <h2>{mode === "traditional" ? "Tool Calling" : "Code Mode"}</h2>
          <span>
            {mode === "traditional"
              ? "The model selects each tool call"
              : "The model writes JavaScript for QuickJS"}
          </span>
        </div>
        {replay && (
          <button
            className="panel-replay"
            onClick={onReplay}
            disabled={replayDisabled}
            aria-label={`Replay ${mode === "traditional" ? "Tool Calling" : "Code Mode"}`}
          >
            <RotateCcw size={13} /> Replay
          </button>
        )}
        <span className={`execution-status ${trace?.status || ""}`}>
          {trace?.status === "complete" ? (
            <>
              <Check size={12} />
              {replay ? "Recorded" : "Complete"}
            </>
          ) : trace?.status === "error" ? (
            "Failed"
          ) : hasStarted && running ? (
            <>
              <Loader2 size={12} className="spinning" />
              Running
            </>
          ) : (
            "Ready"
          )}
        </span>
      </header>
      <div
        className="execution-scroll"
        ref={scroller}
        onScroll={() => {
          const el = scroller.current;
          if (el)
            setFollowing(el.scrollHeight - el.scrollTop - el.clientHeight < 65);
        }}
      >
        {!hasStarted ? (
          <div className="execution-empty">
            <div>
              {mode === "traditional" ? (
                <Braces size={30} />
              ) : (
                <Code2 size={30} />
              )}
            </div>
            <h3>
              {mode === "traditional"
                ? "Individual tool calls"
                : "Tool calls inside JavaScript"}
            </h3>
            <p>
              {mode === "traditional"
                ? "The model sees the exposed catalog and decides which calls to make."
                : "The model discovers relevant capabilities, then writes JavaScript for QuickJS."}
            </p>
            <span>Waiting for a real execution</span>
          </div>
        ) : (
          <>
            <div className="event-timeline">
              {events
                .filter((e) => e.type !== "code.generated")
                .map((event, i) => (
                  <motion.button
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={event.id}
                    className={`timeline-event event-${event.type.replace(".", "-")}`}
                    onClick={() => inspect(event)}
                  >
                    <span className="timeline-glyph">
                      {event.type === "model.request" ? (
                        <Activity size={14} />
                      ) : event.type === "tool.start" ||
                        event.type === "tool.end" ? (
                        <Check size={14} />
                      ) : event.type.includes("discovery") ? (
                        <Search size={14} />
                      ) : event.type === "run.error" ? (
                        <TriangleAlert size={14} />
                      ) : (
                        <Braces size={14} />
                      )}
                    </span>
                    <span className="event-content">
                      <span className="event-category">
                        {event.type === "model.request"
                          ? `Model interaction ${event.metrics?.modelRequests || 1}`
                          : event.type}
                      </span>
                      <strong>{event.name}</strong>
                    </span>
                    <span className="event-meta">
                      {event.durationMs !== undefined
                        ? `${event.durationMs.toFixed(0)} ms`
                        : new Date(event.timestamp).toLocaleTimeString("en-GB")}
                      <ChevronRight size={12} />
                    </span>
                  </motion.button>
                ))}
            </div>
            {code?.code && (
              <div className="generated-code">
                <div>
                  <Code2 size={14} />
                  <strong>Model-generated JavaScript</strong>
                  <span>ES2020</span>
                </div>
                <CodeEditor code={code.code} title="generated-workflow.js" />
                <p>
                  Runtime instrumentation reports tool boundaries; line-level
                  highlighting is unavailable.
                </p>
              </div>
            )}
            {trace?.status === "complete" && (
              <div className="final-answer">
                <span>
                  <CheckCheck size={16} />
                  Final result
                </span>
                {Array.isArray(answer?.options) && answer.options.length > 0 ? (
                  <>
                    <div className="flight-results">
                      {answer.options.map((f, i) => (
                        <div key={f.id || f.flightId || i}>
                          <span className="flight-rank">{i + 1}</span>
                          <div>
                            <strong>{f.airline || f.id || f.flightId}</strong>
                            <span>
                              {f.id || f.flightId}, {f.checkedKg ?? "—"} kg
                              checked
                            </span>
                          </div>
                          <strong>
                            {typeof f.price === "number"
                              ? `₹${f.price.toLocaleString("en-IN")}`
                              : "—"}
                          </strong>
                        </div>
                      ))}
                    </div>
                    {answer.explanation && <p>{answer.explanation}</p>}
                  </>
                ) : (
                  <pre>
                    {typeof trace.answer === "string"
                      ? trace.answer
                      : JSON.stringify(trace.answer, null, 2)}
                  </pre>
                )}
              </div>
            )}
            {trace?.error && (
              <div className="panel-failure">
                <TriangleAlert size={17} />
                <p>{trace.error}</p>
              </div>
            )}
          </>
        )}
      </div>
      <footer>
        <span>
          {replay ? "Replay" : hasStarted ? "Live trace" : "Awaiting execution"}
          {!following && hasStarted && (
            <button onClick={() => setFollowing(true)}>Jump to latest</button>
          )}
        </span>
        <span>
          {events.length} events,{" "}
          {number(
            trace?.metrics.toolCalls ??
              events.filter((e) => e.type === "tool.start").length,
          )}{" "}
          underlying calls
        </span>
      </footer>
    </section>
  );
}
const metricRows: {
  key: keyof Metrics;
  label: string;
  unit?: string;
  estimated?: boolean;
}[] = [
  { key: "exposedTools", label: "Exposed tools" },
  {
    key: "initialDefinitionTokens",
    label: "Initial tool definition tokens",
    estimated: true,
  },
  { key: "inputTokens", label: "Total model input tokens" },
  { key: "outputTokens", label: "Total model output tokens" },
  { key: "modelRequests", label: "Model API requests" },
  { key: "toolCalls", label: "Underlying tool calls" },
  {
    key: "intermediateBytes",
    label: "Tool response bytes sent to model",
    unit: "B",
  },
  { key: "latencyMs", label: "Execution wall time", unit: "ms" },
  { key: "costUSD", label: "Estimated inference cost", unit: "USD" },
];
function MetricsComparison({
  metrics,
  complete,
  replay,
}: {
  metrics: Partial<Record<Mode, Metrics>>;
  complete: boolean;
  replay: boolean;
}) {
  return (
    <section className="metrics-dashboard">
      <div className="metrics-dashboard-heading">
        <div>
          <span className="eyebrow">
            Measured on this run
          </span>
          <h3>Execution measurements</h3>
        </div>
        <p>
          Provider usage when available. Definition counts use UTF-8 bytes ÷ 4.
          <br />
          Cost requires configured model pricing. No guaranteed improvement.
        </p>
      </div>
      <div className="metric-comparison-table">
        <div className="metric-table-head">
          <span>Execution metric</span>
          <span>
            <i className="event-dot traditional" />
            Tool Calling
          </span>
          <span>
            <i className="event-dot code" />
            Code Mode
          </span>
          <span>Code Mode compared with Tool Calling</span>
        </div>
        {metricRows.map((row) => {
          const a = metrics.traditional?.[row.key] as number | undefined | null,
            b = metrics.code?.[row.key] as number | undefined | null;
          const max = Math.max(Number(a) || 0, Number(b) || 0, 1);
          const delta =
            typeof a === "number" && a > 0 && typeof b === "number"
              ? ((a - b) / a) * 100
              : null;
          return (
            <div className="metric-table-row" key={row.key}>
              <span>
                {row.label}
                {row.estimated && <small>estimated</small>}
                {["inputTokens", "outputTokens"].includes(row.key) &&
                  modes.some(
                    (m) => metrics[m] && metrics[m]?.usageSource !== "provider",
                  ) && <small>estimated / mixed</small>}
              </span>
              {([a, b] as const).map((value, i) => (
                <div
                  key={i}
                  className={`metric-cell ${i === 0 ? "traditional" : "code"}`}
                >
                  <strong>
                    {value === null || value === undefined
                      ? "—"
                      : row.unit === "USD"
                        ? `$${value.toFixed(5)}`
                        : number(Math.round(value))}
                    {value !== null &&
                      value !== undefined &&
                      row.unit &&
                      row.unit !== "USD" && <small>{row.unit}</small>}
                  </strong>
                  <div>
                    <motion.span
                      animate={{
                        width: `${typeof value === "number" ? (value / max) * 100 : 0}%`,
                      }}
                      transition={{ duration: 0.35 }}
                    />
                  </div>
                </div>
              ))}
              <span className="metric-delta">
                {complete && delta !== null
                  ? `${Math.abs(delta).toFixed(1)}% ${delta > 0 ? "less" : delta < 0 ? "more" : "difference"}`
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="metric-method-note">
        Latency includes MCP startup, model requests and cleanup. Response bytes
        include all MCP responses supplied to the model, including discovery
        schemas and execution results. Underlying API calls are counted
        independently from model requests.
      </div>
    </section>
  );
}
function LiveArchitecture({
  mode,
  events,
}: {
  mode: Mode;
  events: TraceEvent[];
}) {
  const latest = events.at(-1),
    active = latest?.type;
  const nodes =
    mode === "traditional"
      ? [
          ["Language model", "slate"],
          ["MCP client", "blue"],
          ["Individual MCP tools", "green"],
        ]
      : [
          ["Language model", "slate"],
          ["search, get_schema, execute", "blue"],
          ["QuickJS sandbox", "purple"],
          ["Authorized MCP tools", "green"],
        ];
  return (
    <section className={`live-architecture ${mode}`}>
      <div className="architecture-title">
        <span className={`event-dot ${mode}`} />
        <h2>{mode === "traditional" ? "Tool Calling" : "Code Mode"}</h2>
        <span>{events.length ? "Event driven" : "Awaiting execution"}</span>
      </div>
      <div className="architecture-stack">
        {nodes.map(([name, tone], i) => (
          <div className="live-arch-layer" key={name}>
            <div
              className={`live-arch-node ${tone} ${active && ((i === 0 && active.startsWith("model")) || (i === 1 && (active.startsWith("mcp") || active.startsWith("discovery"))) || (i === 2 && mode === "code" && active === "code.generated") || (i === nodes.length - 1 && active.startsWith("tool"))) ? "active" : ""}`}
            >
              {i === 0 ? (
                <Activity size={22} />
              ) : tone === "purple" ? (
                <Code2 size={22} />
              ) : tone === "green" ? (
                <Layers size={22} />
              ) : (
                <Network size={22} />
              )}
              <strong>{name}</strong>
              {tone === "green" && (
                <span>
                  {events.filter((e) => e.type === "tool.start").length} calls
                </span>
              )}
            </div>
            {i < nodes.length - 1 && (
              <svg viewBox="0 0 100 36" className="live-arch-connector">
                <path
                  d="M45 0V30m-4-5 4 5 4-5M55 30V0m-4 5 4-5 4 5"
                  fill="none"
                  stroke="#c4ccda"
                  strokeWidth="1.2"
                />
                {latest && (
                  <motion.circle
                    key={latest.id}
                    r="3"
                    cx="45"
                    fill={mode === "code" ? "#111111" : "#8a8a8a"}
                    initial={{ cy: 0, opacity: 1 }}
                    animate={{ cy: 30, opacity: 0 }}
                    transition={{ duration: 0.7 }}
                  />
                )}
              </svg>
            )}
          </div>
        ))}
      </div>
      <div className="architecture-latest">
        <span>Latest event</span>
        <strong>
          {latest
            ? `${latest.type}, ${latest.name}`
            : "Run a workflow to see the data flow."}
        </strong>
      </div>
    </section>
  );
}
