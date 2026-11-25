import { McpApp, Module, CodeModeTransform } from "@nitrostack/core";
import { TravelController } from "./travel.tools.js";
import { TravelService } from "./travel.service.js";
export const mode = process.env.TRAVEL_MODE || "traditional";
export const sandboxOptions = {
  workerPoolSize: 1,
  memoryLimitMb: 64,
  timeoutMs: 2000,
  maxToolCalls: 40,
  allowDestructive: false,
  executeToolDescription:
    'Execute an ES2020 JavaScript async function BODY in QuickJS. The code string runs directly inside an async function. Use top-level await callTool(name, argsObject) and return the final JSON value. Do NOT submit a bare async arrow function or uninvoked function declaration; those do not execute. Do not use Markdown fences, TypeScript types or imports. Contract example: const result = await callTool("tool_name", {}); return result;',
};
@McpApp({
  module: AppModule,
  server: {
    name: `travel-${mode}`,
    version: "1.0.0",
    protocolVersion: "2025-06-18",
  },
  logging: { level: "error" },
  transport: { type: "stdio" },
  transforms: mode === "code" ? [new CodeModeTransform(sandboxOptions)] : [],
})
@Module({
  name: "travel",
  controllers: [TravelController],
  providers: [TravelService],
})
export class AppModule {}
