/**
 * Compact View-side pattern. Verify current @modelcontextprotocol/ext-apps API.
 */
import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "Supplier Compare View", version: "1.0.0" });
const root = document.querySelector<HTMLDivElement>("#root")!;

app.ontoolresult = (result) => {
  const text = result.content?.find((item) => item.type === "text")?.text;
  root.textContent = text ?? "No result";
};

// The View can request fresh tool data while remaining inside the host-controlled bridge.
document.querySelector("#refresh")?.addEventListener("click", async () => {
  await app.callServerTool({ name: "compare-suppliers", arguments: {} });
});

app.connect();
