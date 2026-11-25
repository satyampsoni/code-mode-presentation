"use client";
import { useEffect, useState } from "react";
import { Activity, ExternalLink, Loader2, RefreshCw } from "lucide-react";
export default function GrafanaDashboard({
  recordingId,
}: {
  recordingId: string;
}) {
  const [ready, setReady] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const r = await fetch("/api/demo/status");
        const data = await r.json();
        if (alive) setReady(!!data.grafana?.ready);
      } catch {
        if (alive) setReady(false);
      }
    };
    void check();
    const timer = setInterval(check, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [attempt]);
  const url = `http://localhost:3300/d/travel-agent-demo/nitrostack-recorded-agent-execution?orgId=1&theme=light&kiosk&refresh=2s&var-recording=${encodeURIComponent(recordingId)}`;
  return (
    <section
      className="grafana-dashboard"
      aria-label="Embedded Grafana recorded execution dashboard"
    >
      <header>
        <div>
          <span className="eyebrow">
            GRAFANA + PROMETHEUS · GENUINE RECORDINGS
          </span>
          <h3>Recorded execution, fully observable.</h3>
        </div>
        <div>
          <span className={`grafana-connection ${ready ? "ready" : ""}`}>
            <i />
            {ready ? "Grafana connected" : "Connecting to Grafana"}
          </span>
          <a href={url} target="_blank" rel="noreferrer">
            Open Grafana
            <ExternalLink size={13} />
          </a>
        </div>
      </header>
      <p>
        Original recorded measurements for both execution modes. Provider token
        usage, tool calls, retries, latency and intermediate data are exposed
        through Prometheus.
      </p>
      {ready && recordingId ? (
        <iframe
          key={recordingId}
          title="Grafana: Traditional MCP and Code Mode recorded measurements"
          src={url}
          loading="lazy"
        />
      ) : (
        <div className="grafana-loading">
          <Loader2 size={24} className="spinning" />
          <strong>
            {ready
              ? "Select a genuine recording to load both modes."
              : "Waiting for the local Grafana instance."}
          </strong>
          <span>Start Docker Desktop and run:</span>
          <code>npm run observability:start</code>
          <button onClick={() => setAttempt((a) => a + 1)}>
            <RefreshCw size={14} />
            Check connection
          </button>
        </div>
      )}
      <footer>
        Recorded values are preserved from the saved trace. Scrape timestamps
        represent dashboard refresh time. Estimates and provider waits remain
        labeled.
      </footer>
    </section>
  );
}
