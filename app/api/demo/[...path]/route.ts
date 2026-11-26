import type { NextRequest } from "next/server";
import { hostedDemo } from "../../../../lib/hosted-demo";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (
    path.length !== 1 ||
    !["status", "sources", "run", "replay", "security"].includes(path[0])
  )
    return Response.json({ error: "Unknown demo endpoint" }, { status: 404 });
  const origin = request.headers.get("origin");
  let originHost: string | undefined;
  try { originHost = origin ? new URL(origin).host : undefined; }
  catch { return Response.json({ error: "Invalid request origin" }, { status: 403 }); }
  if (
    (originHost &&
      originHost !==
        (request.headers.get("host") || request.nextUrl.host)) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return Response.json(
      { error: "Same-origin requests required" },
      { status: 403 },
    );
  if ((process.env.VERCEL === "1" || process.env.DEMO_HOSTED_REPLAY === "1") && !process.env.DEMO_AGENT_URL)
    return hostedDemo(request, path[0]);
  try {
    const baseUrl = process.env.DEMO_AGENT_URL || `http://127.0.0.1:${process.env.DEMO_AGENT_PORT || 4100}`;
    if (process.env.VERCEL === "1" && !baseUrl.startsWith("https://"))
      return Response.json({ error: "The hosted live agent requires an HTTPS endpoint." }, { status: 503 });
    const result = await fetch(
      `${baseUrl.replace(/\/$/, "")}/${path[0]}`,
      {
        method: request.method,
        headers: {
          "content-type": "application/json",
          ...(process.env.DEMO_AGENT_TOKEN ? { authorization: `Bearer ${process.env.DEMO_AGENT_TOKEN}` } : {}),
        },
        body: request.method === "POST" ? await request.text() : undefined,
        signal: request.signal,
        cache: "no-store",
      },
    );
    return new Response(result.body, {
      status: result.status,
      headers: {
        "content-type":
          result.headers.get("content-type") || "application/json",
        "cache-control": "no-store, no-transform",
        "x-accel-buffering": "no",
      },
    });
  } catch {
    return Response.json(
      {
        error:
          "Travel agent backend is not running. Start all services with npm run demo.",
      },
      { status: 503 },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
