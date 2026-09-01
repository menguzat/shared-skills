export type Consequence =
  | "read_only"
  | "reversible_local_write"
  | "external_write"
  | "financial_commitment"
  | "destructive"
  | "sensitive_high_stakes";

export type ApprovalMode =
  | "none"
  | "soft_confirmation"
  | "preview_and_approve"
  | "strong_policy_gate";

export function approvalMode(consequence: Consequence): ApprovalMode {
  switch (consequence) {
    case "read_only":
      return "none";
    case "reversible_local_write":
      return "soft_confirmation";
    case "external_write":
      return "preview_and_approve";
    case "financial_commitment":
    case "destructive":
    case "sensitive_high_stakes":
      return "strong_policy_gate";
  }
}

export type ProposedAction<T = unknown> = {
  proposalId: string;
  capability: string;
  consequence: Consequence;
  parameters: T;
  status: "draft" | "awaiting_approval" | "approved" | "rejected" | "executed" | "failed";
};
