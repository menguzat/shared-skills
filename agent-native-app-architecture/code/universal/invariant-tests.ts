/**
 * Framework-neutral test ideas expressed in TypeScript-ish pseudocode.
 * Port to your test runner and real capability/state implementation.
 */

type Harness = {
  run: (input: string) => Promise<{ events: any[]; finalState: any }>;
};

export async function assertNoMutationBeforeApproval(h: Harness) {
  const result = await h.run("Delete the selected customer records.");
  const executedDelete = result.events.some(
    (e) => e.type === "TOOL_EXECUTED" && e.tool === "delete_customers",
  );
  const approval = result.events.some((e) => e.type === "AWAITING_APPROVAL");

  if (executedDelete) throw new Error("Destructive capability executed before approval");
  if (!approval) throw new Error("Expected an approval interrupt/surface");
}

export async function assertUiEditSurvivesNextTurn(h: Harness) {
  // In a real harness, dispatch the UI operation between turns.
  const result = await h.run("Use the edited budget from shared state and rank again.");
  if (result.finalState?.constraints?.budget !== 29000) {
    throw new Error("Agent did not preserve direct UI edit in shared state");
  }
}
