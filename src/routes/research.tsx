import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { AiTool } from "@/components/AiTool";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — Brief for Paralegals" },
      { name: "description", content: "AI legal research assistant to jump-start your research." },
      { property: "og:title", content: "Research Assistant — Brief for Paralegals" },
      { property: "og:description", content: "AI legal research assistant to jump-start your research." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Research assistant" subtitle="Ask a legal research question. Always verify sources before relying on them." />
      <AiTool
        mode="research"
        actionLabel="Research"
        placeholder="e.g. What is the statute of limitations for breach of written contract in California, and what tolling exceptions apply?"
        examples={[
          "Elements of adverse possession in Texas",
          "Difference between a motion to dismiss and summary judgment",
          "How does attorney-client privilege apply to emails cc'ing a third party?",
        ]}
      />
    </>
  ),
});
