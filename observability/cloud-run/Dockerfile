FROM node:22-alpine AS measurements
WORKDIR /build
COPY travel-lab/src/observability.ts travel-lab/src/observability.ts
COPY travel-lab/recordings/ travel-lab/recordings/
RUN node --experimental-strip-types --input-type=module -e "import('./travel-lab/src/observability.ts').then(module => module.refreshRecordedMetrics())"

FROM prom/prometheus:v3.8.0 AS prometheus

FROM grafana/grafana:13.2.1
USER root
RUN apk add --no-cache busybox-extras bash
COPY --from=prometheus /bin/prometheus /usr/local/bin/prometheus
COPY --from=measurements /build/observability/metrics/metrics.txt /opt/travel-observability/metrics/metrics.txt
COPY cloud-run/prometheus.yml /etc/prometheus/prometheus.yml
COPY cloud-run/datasource.yaml /etc/grafana/provisioning/datasources/prometheus.yaml
COPY grafana/provisioning/dashboards/default.yaml /etc/grafana/provisioning/dashboards/default.yaml
COPY grafana/dashboards/travel-demo.json /etc/grafana/dashboards/travel-demo.json
COPY cloud-run/start.sh /opt/travel-observability/start.sh
RUN chmod 755 /opt/travel-observability/start.sh
ENV GF_PATHS_DATA=/tmp/grafana-data \
    GF_PATHS_LOGS=/tmp/grafana-logs \
    GF_PATHS_PLUGINS=/tmp/grafana-plugins \
    GF_AUTH_ANONYMOUS_ENABLED=true \
    GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer \
    GF_AUTH_DISABLE_LOGIN_FORM=true \
    GF_AUTH_BASIC_ENABLED=false \
    GF_USERS_ALLOW_SIGN_UP=false \
    GF_SECURITY_ALLOW_EMBEDDING=true \
    GF_SECURITY_COOKIE_SECURE=true \
    GF_SECURITY_COOKIE_SAMESITE=none \
    GF_SECURITY_CONTENT_SECURITY_POLICY=true \
    GF_SECURITY_CONTENT_SECURITY_POLICY_TEMPLATE="frame-ancestors 'self' https://code-mode-presentation.vercel.app" \
    GF_ANALYTICS_REPORTING_ENABLED=false \
    GF_ANALYTICS_CHECK_FOR_UPDATES=false \
    GF_NEWS_NEWS_FEED_ENABLED=false \
    GF_PLUGINS_PREINSTALL_DISABLED=true \
    GF_USERS_DEFAULT_THEME=dark
USER 472
EXPOSE 8080
ENTRYPOINT ["/opt/travel-observability/start.sh"]
