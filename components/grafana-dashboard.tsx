"use client";
import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
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
  const url = `http://localhost:3300/d/travel-agent-demo?orgId=1&theme=dark&kiosk&refresh=2s&var-recording=${encodeURIComponent(recordingId)}`;
  return (
    <section
      className="grafana-dashboard"
      aria-label="Embedded Grafana live execution dashboard"
    >
      <header>
        <div>
          <span className="eyebrow">GRAFANA · PROMETHEUS</span>
          <h3>Live agent execution</h3>
        </div>
        <div>
          <span className={`grafana-connection ${ready ? "ready" : ""}`}>
            <i />
            {ready ? "Live" : "Connecting"}
          </span>
          <a href={url} target="_blank" rel="noreferrer">
            Open Grafana
            <ExternalLink size={13} />
          </a>
        </div>
      </header>
      {ready && recordingId ? (
        <iframe
          key={recordingId}
          title="Grafana: Traditional MCP and Code Mode live measurements"
          src={url}
          loading="lazy"
        />
      ) : (
        <div className="grafana-loading">
          <Loader2 size={24} className="spinning" />
          <strong>
            {ready
              ? "Waiting for live metrics."
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
    </section>
  );
}
