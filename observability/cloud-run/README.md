# Hosted recorded measurements

This container runs actual Grafana and Prometheus. It exposes Grafana on the Cloud Run `PORT`; Prometheus and the metrics endpoint bind only to loopback. Anonymous access has the Viewer role. Administrative login and signup are disabled, and bootstrap credentials are generated per container.

The build context contains only dashboard configuration, the metrics exporter, and aggregate measurements from complete paired recordings. It excludes raw execution events, prompts, generated code and environment files. Measurements retain their original recording timestamps. This deployment serves recorded measurements; it does not collect production live agent runs.

Prepare and validate locally:

```sh
node scripts/prepare-observability.mjs
# Use the printed temporary directory as BUILD_CONTEXT below.
docker build --platform linux/amd64 -t code-mode-grafana BUILD_CONTEXT
docker run --rm -p 127.0.0.1:3301:8080 code-mode-grafana
```

## Proposed production deployment

- Project: `kubecon-talk`
- Region: `us-central1`
- Service: `code-mode-grafana`
- Resources: one vCPU, 1 GiB memory, minimum zero and maximum one instance.
- Instance billing/CPU allocation: CPU remains allocated while an instance exists so Prometheus can scrape in the background. Idle instances can scale to zero. Compute, builds, storage and traffic can incur Google Cloud charges.
- Public access: HTTPS anonymous Viewer for the existing public demo's recorded measurements. Only the production presentation origin is allowed to frame it.
- Storage: ephemeral Prometheus/Grafana data, reconstructed from the image on each start. No durable historical telemetry or user edits.

After authorization, enable Cloud Run, Cloud Build and Artifact Registry APIs if needed; create a Docker repository named `code-mode-observability` in the region if absent. Build **only the prepared temporary context**, tagging it `us-central1-docker.pkg.dev/kubecon-talk/code-mode-observability/grafana:VERSION`, and deploy that image:

```sh
gcloud run deploy code-mode-grafana \
  --project=kubecon-talk --region=us-central1 \
  --image=IMAGE --port=8080 --cpu=1 --memory=1Gi \
  --min-instances=0 --max-instances=1 --no-cpu-throttling \
  --allow-unauthenticated
```

Set `GF_SERVER_ROOT_URL` to the resulting service HTTPS URL, then verify `/api/health`, `/api/dashboards/uid/travel-agent-demo`, the `travel-prometheus` datasource query results and the framing header. Set Vercel's production `GRAFANA_PUBLIC_URL` to `SERVICE_URL/d/travel-agent-demo?orgId=1&kiosk&theme=dark` and redeploy the presentation. Verify the actual iframe and both recorded modes in production before reporting success.

The initial cold start may delay dashboard availability. Preview deployments cannot frame this instance unless their origins are explicitly added to the CSP template.
