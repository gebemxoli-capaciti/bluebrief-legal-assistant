import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { AiTool } from "@/components/AiTool";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes — ParaLex for Paralegals" },
      { name: "description", content: "Turn raw meeting notes into summaries, action items and deadlines." },
      { property: "og:title", content: "Meeting Notes — ParaLex for Paralegals" },
      { property: "og:description", content: "Turn raw meeting notes into summaries, action items and deadlines." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Meeting notes" subtitle="Paste raw notes or a transcript. Get a summary, action items and deadlines." />
      <AiTool
        mode="notes"
        actionLabel="Summarize"
        placeholder="Paste your meeting notes or transcript here…"
        examples={[
          "Client call w/ M. Alvarez 10/20. Discussed lease dispute. Landlord withheld $4,200 deposit. Client has photos. Atty Kim wants demand letter drafted by 10/27. Need copy of lease + move-out inspection. Client unsure about witness availability. Next call 11/3.",
        ]}
      />
    </>
  ),
});
