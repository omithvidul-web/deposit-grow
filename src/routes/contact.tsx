import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/contexts/AppContext";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Deposit Calculator" },
      { name: "description", content: "Get in touch with the Deposit Calculator team." },
      { property: "og:title", content: "Contact — Deposit Calculator" },
      { property: "og:description", content: "Send us feedback, feature ideas or bug reports." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { content, site } = useApp();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contact</div>
      <h1 className="mt-2 font-display text-4xl font-bold">Say hello</h1>
      <p className="mt-4 text-muted-foreground whitespace-pre-line">{content.contact}</p>
      <a
        href={`mailto:${site.contactEmail}`}
        className="mt-8 inline-flex items-center gap-2 rounded-xl gradient-brand px-5 py-3 text-sm font-medium text-white shadow-lg"
      >
        <Mail className="h-4 w-4" />
        {site.contactEmail}
      </a>
    </div>
  );
}
