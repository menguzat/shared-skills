export type RunStatus =
  | "idle"
  | "preparing"
  | "executing"
  | "waiting_for_user"
  | "completed"
  | "failed"
  | "cancelled";

export interface SharedTaskState<Domain = unknown, Draft = unknown> {
  taskId: string;
  intentSummary: string;
  runStatus: RunStatus;
  domain: Domain;
  draft?: Draft;
  selection: string[];
  constraints: Record<string, unknown>;
  pendingApproval?: {
    proposalId: string;
    capability: string;
    parameters: Record<string, unknown>;
  };
  lastAuthoritativeResult?: {
    capability: string;
    success: boolean;
    reference?: string;
    at: string;
  };
}

// Both chat commands and direct UI interactions should dispatch operations against
// this same state rather than maintaining disconnected copies.
export type TaskOperation =
  | { type: "SET_CONSTRAINT"; key: string; value: unknown }
  | { type: "SET_SELECTION"; ids: string[] }
  | { type: "SET_RUN_STATUS"; status: RunStatus }
  | { type: "SET_APPROVAL"; proposalId: string; capability: string; parameters: Record<string, unknown> }
  | { type: "CLEAR_APPROVAL" };
