import "reflect-metadata";
import { McpApplicationFactory } from "@nitrostack/core";
import { AppModule } from "./app.module.js";
const server = await McpApplicationFactory.create(AppModule);
await server.start({ transport: "stdio" });

// Stop the isolated server and its worker pool when the owning MCP client closes.
process.stdin.on("end", () => {
  void server.stop().finally(() => process.exit(0));
});
