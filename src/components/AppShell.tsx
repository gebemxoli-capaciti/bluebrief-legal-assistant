import { Link } from "@tanstack/react-router";
import { CheckSquare, Mail, NotebookPen, Search, Moon, Sun, Scale } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Tasks", icon: CheckSquare },
  { to: "/email", label: "Email Drafts", icon: Mail },
  { to: "/notes", label: "Meeting Notes", icon: NotebookPen },
  { to: "/research", label: "Research", icon: Search },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden md:inline">{dark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex items-center justify-between border-b bg-sidebar px-4 py-3 md:sticky md:top-0 md:h-screen md:w-60 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r md:px-4 md:py-6">
        <div className="flex items-center gap-2 md:mb-8 md:px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-calm text-primary-foreground">
            <Scale className="h-4 w-4" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Brief</span>
        </div>
        <nav className="flex gap-1 md:flex-1 md:flex-col">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </aside>
      <main className="flex-1 px-5 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-4xl font-medium tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
    </header>
  );
}
