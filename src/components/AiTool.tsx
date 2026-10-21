import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { runAssistant } from "@/lib/ai.functions";

export function AiTool({
  mode,
  placeholder,
  actionLabel,
  examples,
}: {
  mode: "email" | "notes" | "research";
  placeholder: string;
  actionLabel: string;
  examples: string[];
}) {
  const run = useServerFn(runAssistant);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (input.trim().length < 3) return toast.error("Please add a bit more detail.");
    setLoading(true);
    try {
      const res = await run({ data: { mode, input } });
      if (res.error) toast.error(res.error);
      else setOutput(res.text);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-4 shadow-soft">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="min-h-40 resize-y border-0 bg-transparent p-1 text-base shadow-none focus-visible:ring-0"
          maxLength={20000}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground transition-colors hover:bg-accent"
              >
                {ex.length > 40 ? ex.slice(0, 40) + "…" : ex}
              </button>
            ))}
          </div>
          <Button onClick={submit} disabled={loading} className="bg-gradient-calm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {actionLabel}
          </Button>
        </div>
      </div>

      {output && (
        <div className="relative rounded-2xl border bg-card p-6 shadow-soft">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-3 top-3"
            onClick={() => {
              navigator.clipboard.writeText(output);
              toast.success("Copied");
            }}
          >
            <Copy className="h-4 w-4" /> Copy
          </Button>
          <div className="prose-ai pr-16 text-sm text-card-foreground">
            <ReactMarkdown>{output}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
