import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { AiTool } from "@/components/AiTool";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Drafts — Brief for Paralegals" },
      { name: "description", content: "Draft professional client and court emails in seconds." },
      { property: "og:title", content: "Email Drafts — Brief for Paralegals" },
      { property: "og:description", content: "Draft professional client and court emails in seconds." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Email drafts" subtitle="Describe what you need to send. Get a polished draft ready to review." />
      <AiTool
        mode="email"
        actionLabel="Draft email"
        placeholder="e.g. Remind client Jane Doe to send signed engagement letter and bank statements by Friday for her divorce case…"
        examples={[
          "Request medical records from St. Mary's Hospital for client John Smith, DOB 03/14/1980, for personal injury claim.",
          "Notify opposing counsel that our deposition of Mr. Lee is rescheduled to Nov 4 at 10am.",
          "Follow up with client on outstanding retainer payment, polite but firm.",
        ]}
      />
    </>
  ),
});
