export type TaskShape = {
  ambiguity: "low" | "medium" | "high";
  precision: "low" | "high";
  density: "low" | "high";
  comparisonCount?: number;
  spatial?: boolean;
  temporal?: boolean;
  persistent?: boolean;
  repeated?: boolean;
  consequential?: boolean;
  structuredMissingFields?: number;
};

export type Surface =
  | "conversation"
  | "text"
  | "inline-card"
  | "form"
  | "table"
  | "map"
  | "timeline"
  | "approval"
  | "workspace";

/**
 * Deterministic policy example.
 * The model may propose a task shape, but the product decides which surfaces are allowed.
 */
export function chooseSurface(task: TaskShape): Surface {
  if (task.consequential) return "approval";
  if (task.persistent) return "workspace";
  if (task.spatial) return "map";
  if (task.temporal && task.density === "high") return "timeline";
  if ((task.comparisonCount ?? 0) > 3 || task.density === "high") return "table";
  if ((task.structuredMissingFields ?? 0) >= 2) return "form";
  if (task.precision === "high" && task.repeated) return "inline-card";
  if (task.ambiguity === "high") return "conversation";
  return "text";
}
