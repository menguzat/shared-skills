/**
 * Compact MCP Apps pattern based on the current official "tool + UI resource" model.
 * Verify current package APIs and security guidance before use:
 * https://github.com/modelcontextprotocol/ext-apps
 */

import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function buildServer(widgetHtml: string) {
  const server = new McpServer({ name: "supplier-compare", version: "1.0.0" });
  const resourceUri = "ui://supplier-compare/view.html";

  registerAppTool(
    server,
    "compare-suppliers",
    {
      title: "Compare suppliers",
      description: "Returns normalized supplier comparison data.",
      inputSchema: {},
      _meta: { ui: { resourceUri } },
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({ suppliers: [], generatedAt: new Date().toISOString() }),
        },
      ],
    }),
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: widgetHtml }],
    }),
  );

  return server;
}
