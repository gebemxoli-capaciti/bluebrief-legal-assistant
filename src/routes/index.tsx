import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { matter?: string } => {
    const m = s["matter"];
    return typeof m === "string" && m ? { matter: m } : {};
  },
  head: () => ({
    meta: [
      { title: "ParaLex — Task Manager for Paralegals" },
      { name: "description", content: "A calm task manager with AI email drafting, meeting summaries and legal research for paralegals." },
      { property: "og:title", content: "ParaLex — Task Manager for Paralegals" },
      { property: "og:description", content: "A calm task manager with AI tools built for paralegals." },
    ],
  }),
  component: Tasks,
});

type Priority = "high" | "medium" | "low";
type Task = { id: string; title: string; matter: string; due: string; priority: Priority; done: boolean };

const SEED: Task[] = [
  { id: "1", title: "File motion to compel with court clerk", matter: "Alvarez v. Kent", due: "", priority: "high", done: false },
  { id: "2", title: "Prepare deposition exhibit binder", matter: "Lee Estate", due: "", priority: "medium", done: false },
  { id: "3", title: "Update conflict check database", matter: "Admin", due: "", priority: "low", done: true },
];

const PRIORITY_STYLE: Record<Priority, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/15 text-warning",
  low: "bg-success/15 text-success",
};

function Tasks() {
  const { matter: matterFilter } = Route.useSearch();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [matter, setMatter] = useState(matterFilter ?? "");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<"all" | "open" | "done">("open");

  useEffect(() => {
    const raw = localStorage.getItem("brief-tasks");
    setTasks(raw ? JSON.parse(raw) : SEED);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem("brief-tasks", JSON.stringify(tasks));
  }, [tasks, loaded]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks([{ id: crypto.randomUUID(), title: title.trim().slice(0, 200), matter: matter.trim().slice(0, 100), due, priority, done: false }, ...tasks]);
    setTitle("");
    setMatter("");
    setDue("");
  };

  const scoped = matterFilter ? tasks.filter((t) => t.matter.trim().toLowerCase() === matterFilter.trim().toLowerCase()) : tasks;
  const visible = scoped.filter((t) => (filter === "all" ? true : filter === "open" ? !t.done : t.done));
  const openCount = scoped.filter((t) => !t.done).length;

  return (
    <>
      <PageHeader title={matterFilter ? `Tasks · ${matterFilter}` : "Tasks"} subtitle={`${openCount} open ${openCount === 1 ? "task" : "tasks"}${matterFilter ? " for this case." : " across your matters."}`} />
      {matterFilter && (
        <Link to="/" search={{}} className="-mt-6 mb-6 inline-block text-xs text-primary hover:underline">Show all tasks</Link>
      )}

      <form onSubmit={add} className="mb-6 rounded-2xl border bg-card p-4 shadow-soft">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task…" className="border-0 px-1 text-base shadow-none focus-visible:ring-0" />
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
          <Input value={matter} onChange={(e) => setMatter(e.target.value)} placeholder="Matter / case" className="h-9 w-44" />
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-9 w-40" />
          <div className="flex rounded-lg bg-muted p-0.5">
            {(["high", "medium", "low"] as Priority[]).map((p) => (
              <button type="button" key={p} onClick={() => setPriority(p)} className={`rounded-md px-3 py-1 text-xs capitalize transition-colors ${priority === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {p}
              </button>
            ))}
          </div>
          <Button type="submit" size="sm" className="ml-auto bg-gradient-calm">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </form>

      <div className="mb-4 flex gap-4 text-sm">
        {(["open", "done", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`capitalize ${filter === f ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {visible.map((t) => (
          <li key={t.id} className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-shadow hover:shadow-soft">
            <Checkbox checked={t.done} onCheckedChange={() => setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} />
            <div className="min-w-0 flex-1">
              <p className={`truncate ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                {t.matter && <span>{t.matter}</span>}
                {t.due && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(t.due + "T00:00").toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
            <button onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))} aria-label="Delete task" className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {loaded && visible.length === 0 && <li className="py-12 text-center text-sm text-muted-foreground">Nothing here. Enjoy the calm.</li>}
      </ul>
    </>
  );
}
