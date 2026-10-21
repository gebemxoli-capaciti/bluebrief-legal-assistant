import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { CalendarDays, Copy, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { runAssistant } from "@/lib/ai.functions";
import { buildPlannerInput, plannerSettingsSchema, readPlannerWorkload, type PlannerTask, type PlannerCase } from "@/lib/planner";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [
    { title: "Weekly Planner — ParaLex" },
    { name: "description", content: "Plan a practical week from your open paralegal tasks, case deadlines and availability with AI." },
    { property: "og:title", content: "Weekly Planner — ParaLex" },
    { property: "og:description", content: "AI-assisted weekly schedules grounded in your tasks and case deadlines." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Planner,
});

type SavedPlan = { text: string; generated: string; snapshot: string };
const STORAGE = "paralex-weekly-plan";

function Planner() {
  const run = useServerFn(runAssistant);
  const [workload, setWorkload] = useState<{ tasks: PlannerTask[]; cases: PlannerCase[] }>({ tasks: [], cases: [] });
  const [loaded, setLoaded] = useState(false);
  const [start, setStart] = useState("");
  const [hours, setHours] = useState("6");
  const [constraints, setConstraints] = useState("");
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStart(format(new Date(), "yyyy-MM-dd"));
    const refresh = () => {
      try { setWorkload(readPlannerWorkload()); setError(""); }
      catch { setError("Your saved workload couldn't be read. Check your Tasks and Cases before planning."); }
      setLoaded(true);
    };
    refresh();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) ?? "null");
      if (saved && typeof saved.text === "string" && typeof saved.generated === "string" && typeof saved.snapshot === "string") {
        const settings = plannerSettingsSchema.safeParse(JSON.parse(saved.snapshot)?.settings);
        setPlan(saved);
        if (settings.success) {
          setStart(settings.data.start); setHours(String(settings.data.hours)); setConstraints(settings.data.constraints);
        }
      }
    } catch { /* An unreadable saved proposal does not block a new plan. */ }
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("storage", refresh); };
  }, []);

  const settings = plannerSettingsSchema.safeParse({ start, hours: Number(hours), constraints });
  const openTasks = workload.tasks.filter((t) => !t.done);
  const deadlines = workload.cases.flatMap((c) => c.deadlines);
  const snapshot = settings.success ? JSON.stringify({ settings: settings.data, input: buildPlannerInput(workload.tasks, workload.cases, settings.data) }) : "";
  const stale = Boolean(plan && snapshot && plan.snapshot !== snapshot);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.success) { setError("Choose a start date and between 1 and 12 available hours per weekday."); return; }
    setError("");
    setLoading(true);
    try {
      const latest = readPlannerWorkload();
      setWorkload(latest);
      const input = buildPlannerInput(latest.tasks, latest.cases, settings.data);
      if (input.tasks.length === 0 && input.deadlines.length === 0) { setError("Add an open task or case deadline before creating a plan."); return; }
      const serialized = JSON.stringify(input);
      if (serialized.length > 20000) { setError("This workload is too large for one plan. Reduce your open workload before trying again."); return; }
      const result = await run({ data: { mode: "planner", input: serialized } });
      if (result.error) { setError(result.error); return; }
      const next = { text: result.text, generated: new Date().toISOString(), snapshot: JSON.stringify({ settings: settings.data, input }) };
      setPlan(next);
      try { localStorage.setItem(STORAGE, JSON.stringify(next)); }
      catch { toast.error("Your plan is ready, but couldn't be saved on this device."); }
    } catch { setError("The plan couldn't be created. Your tasks and existing plan are unchanged."); }
    finally { setLoading(false); }
  };

  return <>
    <PageHeader title="Weekly planner" subtitle="A practical week, grounded in your tasks and case deadlines." />
    <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-y py-4 text-sm">
      <span><strong>{openTasks.length}</strong> open tasks</span>
      <span><strong>{deadlines.filter((d) => d.date).length}</strong> dated case deadlines</span>
      <Link to="/" search={{}} className="inline-flex items-center gap-1 text-primary hover:underline">Tasks <ArrowRight className="h-3 w-3" /></Link>
      <Link to="/cases" className="inline-flex items-center gap-1 text-primary hover:underline">Cases <ArrowRight className="h-3 w-3" /></Link>
    </div>
    <form onSubmit={generate} className="space-y-5 border-b pb-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium" htmlFor="plan-start"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />Starting date</span><Input id="plan-start" type="date" required value={start} onChange={(e) => setStart(e.target.value)} disabled={loading} /></label>
        <label className="space-y-2 text-sm font-medium" htmlFor="plan-hours"><span className="block">Available hours per weekday</span><Input id="plan-hours" type="number" min="1" max="12" step="0.5" required value={hours} onChange={(e) => setHours(e.target.value)} disabled={loading} /></label>
      </div>
      <label htmlFor="plan-constraints" className="block space-y-2 text-sm font-medium"><span>Meetings, availability & preferences</span><Textarea id="plan-constraints" value={constraints} onChange={(e) => setConstraints(e.target.value)} maxLength={4000} disabled={loading} placeholder="e.g. Client meeting Thursday 10–11; no work Friday afternoon; prioritize the Alvarez motion." className="min-h-24" /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Proposed schedule only · Legal deadlines stay unchanged</p>
        <Button type="submit" disabled={!loaded || loading || !settings.success || (!openTasks.length && !deadlines.length)}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Planning your week…" : plan ? "Regenerate plan" : "Plan my week"}
        </Button>
      </div>
    </form>
    {loaded && !openTasks.length && !deadlines.length && <div className="py-10 text-center"><CalendarDays className="mx-auto mb-3 h-8 w-8 text-primary" /><p className="text-muted-foreground">No open work to plan yet.</p><Button asChild variant="outline" className="mt-4"><Link to="/" search={{}}>Add a task <ArrowRight className="h-4 w-4" /></Link></Button></div>}
    {plan && <section className="pt-6" aria-label="Weekly plan">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-2xl">Your proposed week</h2><p className="mt-1 text-xs text-muted-foreground">Saved on this device · {new Date(plan.generated).toLocaleString()}</p></div><Button variant="outline" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(plan.text); toast.success("Plan copied"); } catch { toast.error("Couldn't copy your plan."); } }}><Copy className="h-4 w-4" />Copy plan</Button></div>
      {stale && <p role="status" className="mb-4 border-l-2 border-warning pl-3 text-sm text-muted-foreground">Your workload or availability has changed. Regenerate to update this proposal.</p>}
      <div className="prose-ai break-words text-sm"><ReactMarkdown>{plan.text}</ReactMarkdown></div>
    </section>}
  </>;
}