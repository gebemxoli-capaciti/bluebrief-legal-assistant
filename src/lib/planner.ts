import { z } from "zod";
import { addDays, format, isValid, parseISO } from "date-fns";

const date = z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value)) && format(parseISO(value), "yyyy-MM-dd") === value, "Choose a valid date");
export const plannerTaskSchema = z.object({
  id: z.string(), title: z.string(), matter: z.string(), due: z.union([z.literal(""), date]),
  priority: z.enum(["high", "medium", "low"]), done: z.boolean(),
});
export const plannerCaseSchema = z.object({
  id: z.string(), name: z.string(),
  deadlines: z.array(z.object({ id: z.string(), label: z.string(), date: z.union([z.literal(""), date]) })),
});
export type PlannerTask = z.infer<typeof plannerTaskSchema>;
export type PlannerCase = z.infer<typeof plannerCaseSchema>;
export const plannerSettingsSchema = z.object({
  start: date, hours: z.number().min(1).max(12), constraints: z.string().max(4000),
});

export function buildPlannerInput(tasks: PlannerTask[], cases: PlannerCase[], settings: z.infer<typeof plannerSettingsSchema>) {
  const end = format(addDays(parseISO(settings.start), 6), "yyyy-MM-dd");
  return {
    period: { start: settings.start, end },
    hoursPerWeekday: settings.hours,
    constraints: settings.constraints.trim(),
    tasks: tasks.filter((task) => !task.done).map(({ done: _done, ...task }) => task),
    deadlines: cases.flatMap((c) => c.deadlines.map((d) => ({ id: `${c.id}:${d.id}`, matter: c.name, label: d.label, date: d.date }))),
  };
}

export function readPlannerWorkload() {
  const tasks = z.array(plannerTaskSchema).parse(JSON.parse(localStorage.getItem("brief-tasks") ?? "[]"));
  const cases = z.array(plannerCaseSchema).parse(JSON.parse(localStorage.getItem("brief-cases") ?? "[]"));
  return { tasks, cases };
}