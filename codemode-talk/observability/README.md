# Recorded execution dashboard

This is an actual Grafana instance backed by Prometheus, embedded at the bottom of `/demo`.

Start Docker Desktop, then run `npm run demo` from the app directory. This builds the travel lab and production presentation, exports saved measurements, starts the Docker services and starts the app and agent. The production server keeps the presentation stable while telemetry updates. Existing genuine recordings replay without provider credentials or new model calls. A live execution requires the provider configuration described in `travel-lab/README.md`.

Endpoints:

- App: http://localhost:3000/demo
- Grafana: http://localhost:3300/d/travel-agent-demo
- Prometheus: http://localhost:9095

`npm run observability:start` starts just the Docker services; `npm run observability:stop` stops them. Stopping the app leaves the dashboard services running. Published ports bind only to localhost. Grafana permits anonymous viewing for the local iframe.

The agent exports numeric metrics from complete paired recordings in `travel-lab/recordings/*.json` to `metrics/metrics.txt`. Prometheus scrapes this local export every two seconds. Grafana refreshes every five seconds. The recording selector follows the pair selected in the app. Single-mode and incomplete captures are excluded. Live counters are exported separately with `source="live"`.

Panels show exposed tools, estimated initial definition tokens, actual provider token usage, API requests including retries, underlying tool calls, response bytes, latency and calculated comparison deltas. Provider waits and retries remain part of the genuine measurements. Cost is only available when pricing is configured. The scrape timestamp indicates refresh time; `agent_demo_recorded_timestamp_seconds` preserves the original capture time.

Grafana and Prometheus use bounded, temporary RAM storage (256 MB each). Their caches reset when containers restart. Saved JSON traces, provisioned dashboard and datasource definitions remain on the host and restore the recorded dashboard automatically. Existing Docker images, volumes and other applications are unaffected.

Dashboard source: `grafana/dashboards/travel-demo.json`. Datasource and dashboard provisioning live in `grafana/provisioning`. The official NitroStack logo used by the app is stored in `public/nitrostack-logo.png`.
