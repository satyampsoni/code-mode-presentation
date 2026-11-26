# Vercel deployment

The Next.js application lives at the repository root. Vercel deploys the presentation, assets, Build Mode source walkthrough, and genuine saved demo replay. No model credentials are required for replay. Local development still uses `npm run demo` with the live agent and Docker observability stack.

## Initial deployment

From the repository root, sign in with `vercel login`, then link the project:

```sh
vercel link --yes --project code-mode-presentation
vercel deploy --prod --yes
```

Use the Next.js framework preset and the repository root as Root Directory. `vercel.json` installs with `npm ci` and builds with `npm run build`. Do not upload `.env.local` or model API keys. `.vercelignore` excludes credentials, local telemetry, debugging output, and research files. The saved recordings and source allowlist are included explicitly in the serverless bundle.

## CI/CD

`.github/workflows/ci-cd.yml` runs on pull requests, pushes to `main`, and manual dispatch:

1. Install locked dependencies on Node 22.
2. Run real MCP transport, QuickJS sandbox, agent-loop, and hosted replay tests.
3. Pull the Vercel environment configuration, build the deployment artifact once, and deploy it with `--prebuilt` after checks pass.
4. Deploy trusted pull requests as previews; deploy `main` to production. Fork pull requests run checks without deployment credentials.

Set these repository Actions secrets in `satyampsoni/code-mode-presentation`:

- `VERCEL_TOKEN`: a Vercel token authorized to deploy this project.
- `VERCEL_ORG_ID`: `orgId` from the generated `.vercel/project.json`.
- `VERCEL_PROJECT_ID`: `projectId` from the same file.

Enter secrets through GitHub Settings → Secrets and variables → Actions, or `gh secret set NAME --repo satyampsoni/code-mode-presentation` at its interactive prompt. Never commit them. When secrets are absent, CI still runs all checks and the production build, and explicitly skips deployment. Automatic Vercel Git deployments are disabled in `vercel.json` so they cannot deploy around the test gate or duplicate the Actions deployment.

Commit and push the workflow and application changes after authentication is available. An initial manual Vercel deployment does not activate GitHub Actions until the workflow is pushed and the repository secrets are configured.

## Hosted demo behavior

On Vercel, `/demo` automatically uses recorded replay. The server reads complete, paired recordings from `travel-lab/recordings`, streams the original events and returns the original answers and metrics. Both-mode and individual-panel replay work without making provider calls or writing to the filesystem. Live execution and the actual sandbox timeout test remain local capabilities.

To verify this mode locally:

```sh
npm run test:hosted
DEMO_HOSTED_REPLAY=1 npm run dev
```

## Actual Grafana and a live backend

Vercel does not run this repository's Docker Compose services. To embed an actual hosted Grafana dashboard, set `GRAFANA_PUBLIC_URL` to its HTTPS dashboard URL. The Grafana instance must allow framing and viewer access from the presentation; localhost dashboard URLs are only useful with the local lab. Without a hosted dashboard, the deployment clearly reports that Grafana is not connected.

A separately hosted live agent can be connected with `DEMO_AGENT_URL` (HTTPS) and `DEMO_AGENT_TOKEN` in Vercel's server-side environment settings. The proxy sends the token as a Bearer authorization header. That backend must enforce authentication and its own request limits. Keep provider credentials on the backend. The bundled local agent binds to loopback by default; do not expose it directly as an unauthenticated public service.

No external backend or Grafana deployment is created by the Vercel configuration. The repository's `render.yaml` defines a separate free Grafana service using the [prepared Docker context](observability/render/README.md). It serves genuine recorded measurements and reconstructs them after Render sleeps or restarts. A hosted live agent remains a separate service.

## Validation and references

`npm run build` checks the production Next.js bundle. `npm run test:demo` checks the local runtime. `npm run test:hosted` checks credential-free playback, exact saved answers and measurements, single-mode isolation, rejected live operations and invalid inputs.

- [Vercel GitHub Actions deployment pattern](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel)
- [Vercel Git deployment configuration](https://vercel.com/docs/project-configuration/git-configuration)
- [Vercel function filesystem limits](https://vercel.com/docs/functions/runtimes)
