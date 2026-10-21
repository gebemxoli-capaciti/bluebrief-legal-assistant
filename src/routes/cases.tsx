import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, FileText, CheckSquare, Briefcase, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "Case Dashboard — Brief" },
      { name: "description", content: "See every case with its tasks, deadlines and documents in one calm dashboard." },
      { property: "og:title", content: "Case Dashboard — Brief" },
      { property: "og:description", content: "Every case with its tasks, deadlines and documents in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cases,
});

type Deadline = { id: string; label: string; date: string };
type Doc = { id: string; name: string; url: string };
type Case = { id: string; name: string; client: string; deadlines: Deadline[]; documents: Doc[] };
type Task = { id: string; title: string; matter: string; due: string; priority: string; done: boolean };

const SEED: Case[] = [
  { id: "c1", name: "Alvarez v. Kent", client: "Maria Alvarez", deadlines: [{ id: "d1", label: "Discovery cutoff", date: "" }], documents: [{ id: "f1", name: "Complaint.pdf", url: "" }] },
  { id: "c2", name: "Lee Estate", client: "Lee family", deadlines: [], documents: [] },
];

const fmt = (d: string) => (d ? new Date(d + "T00:00").toLocaleDateString() : "No date");

function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [client, setClient] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("brief-cases");
    setCases(raw ? JSON.parse(raw) : SEED);
    const t = localStorage.getItem("brief-tasks");
    setTasks(t ? JSON.parse(t) : []);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem("brief-cases", JSON.stringify(cases));
  }, [cases, loaded]);

  const update = (id: string, fn: (c: Case) => Case) => setCases(cases.map((c) => (c.id === id ? fn(c) : c)));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCases([{ id: crypto.randomUUID(), name: name.trim().slice(0, 100), client: client.trim().slice(0, 100), deadlines: [], documents: [] }, ...cases]);
    setName("");
    setClient("");
  };

  return (
    <>
      <PageHeader title="Cases" subtitle={`${cases.length} active ${cases.length === 1 ? "case" : "cases"}.`} />

      <form onSubmit={add} className="mb-8 flex flex-wrap gap-2 rounded-2xl border bg-card p-4 shadow-soft">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Case name (e.g. Smith v. Jones)" className="h-9 flex-1 min-w-48" />
        <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" className="h-9 w-48" />
        <Button type="submit" size="sm" className="bg-gradient-calm"><Plus className="h-4 w-4" /> Add case</Button>
      </form>

      <div className="space-y-5">
        {cases.map((c) => (
          <CaseCard key={c.id} c={c} tasks={tasks.filter((t) => t.matter.trim().toLowerCase() === c.name.trim().toLowerCase())} onChange={(fn) => update(c.id, fn)} onDelete={() => setCases(cases.filter((x) => x.id !== c.id))} />
        ))}
        {loaded && cases.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No cases yet. Add your first above.</p>}
      </div>
    </>
  );
}

function CaseCard({ c, tasks, onChange, onDelete }: { c: Case; tasks: Task[]; onChange: (fn: (c: Case) => Case) => void; onDelete: () => void }) {
  const [dl, setDl] = useState("");
  const [dlDate, setDlDate] = useState("");
  const [doc, setDoc] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const open = tasks.filter((t) => !t.done);

  const allDeadlines = [
    ...c.deadlines.map((d) => ({ ...d, fromTask: false })),
    ...open.filter((t) => t.due).map((t) => ({ id: t.id, label: t.title, date: t.due, fromTask: true })),
  ].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Briefcase className="h-4 w-4" /></div>
          <div>
            <h2 className="font-display text-xl font-medium">{c.name}</h2>
            {c.client && <p className="text-xs text-muted-foreground">{c.client}</p>}
          </div>
        </div>
        <button onClick={onDelete} aria-label="Delete case" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium"><CheckSquare className="h-4 w-4 text-primary" /> Tasks ({open.length} open)</h3>
          <ul className="space-y-1 text-sm">
            {tasks.slice(0, 5).map((t) => (
              <li key={t.id} className={`truncate ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</li>
            ))}
            {tasks.length === 0 && <li className="text-xs text-muted-foreground">No tasks for this case.</li>}
          </ul>
          <Link to="/" search={{ matter: c.name }} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Open in Tasks <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium"><Calendar className="h-4 w-4 text-primary" /> Deadlines</h3>
          <ul className="space-y-1 text-sm">
            {allDeadlines.map((d) => (
              <li key={d.id} className="group flex items-center justify-between gap-2">
                <span className="truncate">{d.label}{d.fromTask && <span className="ml-1 text-xs text-muted-foreground">(task)</span>}</span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  {fmt(d.date)}
                  {!d.fromTask && (
                    <button aria-label="Remove deadline" onClick={() => onChange((x) => ({ ...x, deadlines: x.deadlines.filter((y) => y.id !== d.id) }))} className="opacity-0 hover:text-destructive group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                  )}
                </span>
              </li>
            ))}
            {allDeadlines.length === 0 && <li className="text-xs text-muted-foreground">No deadlines.</li>}
          </ul>
          <form className="mt-3 flex gap-1" onSubmit={(e) => { e.preventDefault(); if (!dl.trim()) return; onChange((x) => ({ ...x, deadlines: [...x.deadlines, { id: crypto.randomUUID(), label: dl.trim().slice(0, 100), date: dlDate }] })); setDl(""); setDlDate(""); }}>
            <Input value={dl} onChange={(e) => setDl(e.target.value)} placeholder="Deadline" className="h-8 text-xs" />
            <Input type="date" value={dlDate} onChange={(e) => setDlDate(e.target.value)} className="h-8 w-32 text-xs" />
            <Button type="submit" size="sm" variant="secondary" className="h-8 px-2" aria-label="Add deadline"><Plus className="h-3 w-3" /></Button>
          </form>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4 text-primary" /> Documents</h3>
          <ul className="space-y-1 text-sm">
            {c.documents.map((d) => (
              <li key={d.id} className="group flex items-center justify-between gap-2">
                {d.url ? <a href={d.url} target="_blank" rel="noreferrer" className="truncate text-primary hover:underline">{d.name}</a> : <span className="truncate">{d.name}</span>}
                <button aria-label="Remove document" onClick={() => onChange((x) => ({ ...x, documents: x.documents.filter((y) => y.id !== d.id) }))} className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
              </li>
            ))}
            {c.documents.length === 0 && <li className="text-xs text-muted-foreground">No documents.</li>}
          </ul>
          <form className="mt-3 space-y-1" onSubmit={(e) => { e.preventDefault(); if (!doc.trim()) return; const u = docUrl.trim(); onChange((x) => ({ ...x, documents: [...x.documents, { id: crypto.randomUUID(), name: doc.trim().slice(0, 120), url: /^https?:\/\//.test(u) ? u : "" }] })); setDoc(""); setDocUrl(""); }}>
            <div className="flex gap-1">
              <Input value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="Document name" className="h-8 text-xs" />
              <Button type="submit" size="sm" variant="secondary" className="h-8 px-2" aria-label="Add document"><Plus className="h-3 w-3" /></Button>
            </div>
            <Input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="Link (optional)" className="h-8 text-xs" />
          </form>
        </div>
      </div>
    </section>
  );
}
