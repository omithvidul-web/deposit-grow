import { createFileRoute } from "@tanstack/react-router";
import { CalculatorSection } from "@/components/calculators/CalculatorSection";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { useApp } from "@/contexts/AppContext";
import { AdSlot } from "@/components/ads/AdsGate";
import {
  Sparkles,
  ShieldCheck,
  Gauge,
  LineChart,
  FileDown,
  GitCompare,
  Lightbulb,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Deposit Calculator — Fixed, Term & Savings Deposit Calculator" },
      {
        name: "description",
        content:
          "Free FD, TD and SD calculator. Instantly calculate maturity, compound interest, growth and compare plans. No signup, no login.",
      },
      { property: "og:title", content: "Deposit Calculator — Calculate. Compare. Grow." },
      {
        property: "og:description",
        content:
          "Premium fixed deposit, term deposit and savings calculators with growth charts and PDF reports.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Is Deposit Calculator free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. All calculators are free with no signup required.",
              },
            },
            {
              "@type": "Question",
              name: "What's the difference between FD, TD and SD?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Fixed Deposits lock a lump sum at a fixed rate. Term Deposits typically compound monthly. Savings Deposits allow monthly contributions on top of an opening balance.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { content } = useApp();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="pt-12 pb-10 md:pt-20 md:pb-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-warning" />
          Premium · Private · Instant
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          <span className="text-gradient-brand">{content.hero.title}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          {content.hero.subtitle}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Private — runs in your browser</span>
          <span className="inline-flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5 text-electric" /> Instant calculations</span>
          <span className="inline-flex items-center gap-1.5"><FileDown className="h-3.5 w-3.5 text-electric" /> PDF reports</span>
        </div>
      </section>

      <AdSlot kind="banner" />

      {/* Calculator */}
      <section id="calc" className="scroll-mt-20">
        <CalculatorSection />
      </section>

      {/* Features */}
      <section className="mt-20">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to decide"
          subtitle="Built like a banker's spreadsheet, designed like an app you'd actually use."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: LineChart, title: "Live growth chart", body: "Watch your projection update as you type. Export the chart as PNG." },
            { icon: GitCompare, title: "Compare plans", body: "Stack up to three deposit plans side-by-side and see the best return." },
            { icon: Lightbulb, title: "Smart insights", body: "Auto-generated tips spotting where you'd earn more with small tweaks." },
            { icon: FileDown, title: "PDF reports", body: "One-click branded PDF with details, comparisons and chart." },
            { icon: ShieldCheck, title: "100% private", body: "No accounts, no tracking pixels. Your numbers never leave your browser." },
            { icon: Gauge, title: "Multi-currency", body: "USD, EUR, GBP, INR, LKR and AUD with proper locale formatting." },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl gradient-brand">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <div className="font-display text-base font-semibold">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      <section className="mt-16">
        <HistoryPanel />
      </section>

      <AdSlot kind="native" />

      {/* Tips */}
      <section className="mt-20">
        <SectionHeader eyebrow="Tips" title="Financial tips" subtitle="Small ideas, big compounding." />
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {content.tips.map((t, i) => (
            <div key={i} className="glass rounded-2xl p-4 text-sm">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white">
                {i + 1}
              </span>
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-20">
        <SectionHeader eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-6 glass rounded-2xl p-2 md:p-4">
          <Accordion type="single" collapsible>
            {content.faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* About + Contact previews */}
      <section className="mt-20 grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">About</div>
          <h3 className="mt-1 font-display text-xl font-semibold">Built for clarity</h3>
          <p className="mt-3 text-sm text-muted-foreground line-clamp-6">{content.about}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Contact</div>
          <h3 className="mt-1 font-display text-xl font-semibold">Get in touch</h3>
          <p className="mt-3 text-sm text-muted-foreground">{content.contact}</p>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</div>
      <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
