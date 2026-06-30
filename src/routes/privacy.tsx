import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/contexts/AppContext";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Deposit Calculator" },
      { name: "description", content: "Deposit Calculator privacy policy. We don't collect personal data." },
      { property: "og:title", content: "Privacy Policy — Deposit Calculator" },
      { property: "og:description", content: "How we handle your data: we don't collect it." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { content } = useApp();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Legal</div>
      <h1 className="mt-2 font-display text-4xl font-bold">Privacy Policy</h1>
      <div className="mt-6 text-muted-foreground whitespace-pre-line">{content.privacy}</div>
    </div>
  );
}
