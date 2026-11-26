"use client";
import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
export default function GrafanaDashboard({
  recordingId,
}: {
  recordingId: string;
}) {
  const [ready, setReady] = useState(false),
    [dashboardUrl, setDashboardUrl] = useState("http://localhost:3300"),
    [hosted, setHosted] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const r = await fetch("/api/demo/status");
        const data = await r.json();
        if (alive) {
          setReady(!!data.grafana?.ready);
          setDashboardUrl(data.grafana?.url || "");
          setHosted(data.hosting === "vercel" || !!data.grafana?.hosted);
        }
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
  let url = "";
  try {
    const target = new URL(dashboardUrl);
    if (["http:", "https:"].includes(target.protocol)) {
      if (target.pathname === "/") target.pathname = "/d/travel-agent-demo";
      for (const [key, value] of Object.entries({ orgId: "1", theme: "dark", kiosk: "true", refresh: "2s", "var-recording": recordingId })) target.searchParams.set(key, value);
      url = target.toString();
    }
  } catch {}
  return (
    <section
      className="grafana-dashboard"
      aria-label="Embedded Grafana execution dashboard"
    >
      <header>
        <div>
          <span className="eyebrow">Grafana and Prometheus</span>
          <h3>{hosted ? "Recorded agent execution" : "Live agent execution"}</h3>
        </div>
        <div>
          <span className={`grafana-connection ${ready ? "ready" : ""}`}>
            {ready ? hosted ? "Connected" : "Live" : hosted ? "Not connected" : "Connecting"}
          </span>
          {url && <a href={url} target="_blank" rel="noreferrer">
            Open Grafana
            <ExternalLink size={13} />
          </a>}
        </div>
      </header>
      {ready && recordingId && url ? (
        <iframe
          key={recordingId}
          title={`Grafana: Tool Calling and Code Mode ${hosted ? "recorded" : "live"} measurements`}
          src={url}
          loading="lazy"
        />
      ) : (
        <div className="grafana-loading">
          <Loader2 size={24} className="spinning" />
          <strong>
            {ready
              ? "Waiting for live metrics."
              : hosted ? url ? "Waking up the Grafana dashboard." : "Grafana is not connected to this deployment." : "Waiting for the local Grafana instance."}
          </strong>
          {hosted && url && <span>The free hosted instance may take about a minute to start. Connection checks continue automatically.</span>}
          {!hosted && <><span>Start Docker Desktop and run:</span><code>npm run observability:start</code></>}
          <button onClick={() => setAttempt((a) => a + 1)}>
            <RefreshCw size={14} />
            Check connection
          </button>
        </div>
      )}
    </section>
  );
}
