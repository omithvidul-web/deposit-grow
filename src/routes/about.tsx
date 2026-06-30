import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/contexts/AppContext";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Deposit Calculator" },
      { name: "description", content: "About Deposit Calculator: a free, private fixed deposit, term deposit and savings calculator." },
      { property: "og:title", content: "About — Deposit Calculator" },
      { property: "og:description", content: "Why we built a private deposit calculator that runs in your browser." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { content, site } = useApp();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">About</div>
      <h1 className="mt-2 font-display text-4xl font-bold">About {site.siteName}</h1>
      <div className="prose-invert mt-6 space-y-4 text-muted-foreground whitespace-pre-line">
        {content.about}
      </div>
    </div>
  );
}
