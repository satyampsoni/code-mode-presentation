#!/usr/bin/env bash
set -euo pipefail

export GF_SERVER_HTTP_ADDR=0.0.0.0
export GF_SERVER_HTTP_PORT="${PORT:-8080}"
# Only anonymous Viewer access is exposed. Bootstrap credentials are generated
# per container and never printed, stored in the image, or sent to the browser.
export GF_SECURITY_ADMIN_PASSWORD="$(head -c 48 /dev/urandom | base64 | tr -d '\n')"
mkdir -p /tmp/prometheus "$GF_PATHS_DATA" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS"

/bin/busybox-extras httpd -f -p 127.0.0.1:9096 -h /opt/travel-observability/metrics &
metrics_pid=$!
/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --web.listen-address=127.0.0.1:9090 \
  --storage.tsdb.path=/tmp/prometheus \
  --storage.tsdb.retention.time=1h \
  --storage.tsdb.retention.size=128MB \
  --query.max-concurrency=2 \
  --query.max-samples=100000 \
  --query.timeout=10s &
prometheus_pid=$!
/run.sh &
grafana_pid=$!
cleanup() { kill "$grafana_pid" "$prometheus_pid" "$metrics_pid" 2>/dev/null || true; }
trap cleanup EXIT TERM INT
# Restart the container if any required process exits.
wait -n "$grafana_pid" "$prometheus_pid" "$metrics_pid"
