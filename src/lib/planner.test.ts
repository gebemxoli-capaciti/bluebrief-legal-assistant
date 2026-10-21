import { describe, expect, it } from "vitest";
import { buildPlannerInput, type PlannerTask } from "./planner";

const tasks: PlannerTask[] = [
  { id: "open", title: "File motion", matter: "Alvarez v. Kent", due: "2026-10-23", priority: "high", done: false },
  { id: "done", title: "Completed review", matter: "Alvarez v. Kent", due: "2026-10-20", priority: "low", done: true },
];
const settings = { start: "2026-10-21", hours: 6, constraints: "No work Friday afternoon" };

describe("Weekly planning workload", () => {
  it("includes only open tasks", () => {
    expect(buildPlannerInput(tasks, [], settings).tasks.map((t) => t.id)).toEqual(["open"]);
  });
  it("covers seven calendar days from the selected start", () => {
    expect(buildPlannerInput(tasks, [], settings).period).toEqual({ start: "2026-10-21", end: "2026-10-27" });
  });
  it("preserves task due dates without changing the original task", () => {
    const original = JSON.stringify(tasks);
    expect(buildPlannerInput(tasks, [], settings).tasks[0]?.due).toBe("2026-10-23");
    expect(JSON.stringify(tasks)).toBe(original);
  });
  it("includes case deadlines even when overdue or undated", () => {
    const cases = [{ id: "c1", name: "Lee Estate", deadlines: [{ id: "d1", label: "Filing", date: "2026-10-19" }, { id: "d2", label: "Review", date: "" }] }];
    expect(buildPlannerInput([], cases, settings).deadlines).toEqual([
      { id: "c1:d1", matter: "Lee Estate", label: "Filing", date: "2026-10-19" },
      { id: "c1:d2", matter: "Lee Estate", label: "Review", date: "" },
    ]);
  });
});