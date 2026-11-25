import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import type { Mode } from "./types.js";
export async function connectMcp(
  mode: Mode,
  catalogSize: number,
  onToolEvent?: (event: Record<string, unknown>) => void,
) {
  // Deliberately do not pass provider credentials into the capability server.
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL("./server.js", import.meta.url))],
    env: {
      PATH: process.env.PATH || "",
      TRAVEL_MODE: mode,
      TRAVEL_CATALOG_SIZE: String(catalogSize),
      NITRO_MCP_PROTOCOL_VERSION: "2025-06-18",
    },
    stderr: "pipe",
  });
  let pending = "";
  transport.stderr?.on("data", (chunk: Buffer) => {
    pending += chunk.toString();
    let i;
    while ((i = pending.indexOf("\n")) >= 0) {
      const line = pending.slice(0, i);
      pending = pending.slice(i + 1);
      if (line.startsWith("TRAVEL_EVENT ")) {
        try {
          onToolEvent?.(JSON.parse(line.slice(13)));
        } catch {}
      }
    }
  });
  const client = new Client({
    name: "codemode-conference-agent",
    version: "1.0.0",
  });
  try {
    await client.connect(transport);
    return {
      client,
      transport,
      close: async () => {
        await client.close();
        await transport.close();
      },
    };
  } catch (error) {
    await transport.close();
    throw error;
  }
}
export function unpack(result: unknown): unknown {
  const r = result as {
    structuredContent?: unknown;
    content?: { type: string; text?: string }[];
  };
  if (r.structuredContent !== undefined) return r.structuredContent;
  const text = (r.content || [])
    .filter((c) => c.type === "text")
    .map((c) => c.text || "")
    .join("\n");
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
