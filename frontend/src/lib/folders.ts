import type { Candidate } from "@/lib/api";

export function groupByPositionStage(candidates: Candidate[]) {
  const byPosition = new Map<string, Map<string, number>>();
  for (const c of candidates) {
    if (!byPosition.has(c.position_title)) byPosition.set(c.position_title, new Map());
    const stages = byPosition.get(c.position_title)!;
    stages.set(c.stage, (stages.get(c.stage) ?? 0) + 1);
  }
  return Array.from(byPosition.entries()).map(([position, stages]) => ({
    position,
    stages: Array.from(stages.entries()).map(([stage, count]) => ({ stage, count })),
  }));
}
