import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import {
  defaultAds,
  defaultContent,
  defaultSite,
  getAds,
  getContent,
  getSite,
  setAds,
  setContent,
  setSite,
} from "@/lib/site";
import { getAnalytics, resetAnalytics, mode, topKey } from "@/lib/analytics";
import { clearHistory, getHistory } from "@/lib/history";
import { formatMoney } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/currency";
import { ShieldAlert, Trash2, Download, Upload, BarChart3, Megaphone, Settings, FileText, FileSpreadsheet, DatabaseBackup, FileEdit } from "lucide-react";

const ADMIN_CODE = (import.meta.env.VITE_ADMIN_CODE as string | undefined) ?? "060245";

const searchSchema = z.object({ code: z.string().optional() });

export const Route = createFileRoute("/admin")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Admin — Deposit Calculator" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const search = Route.useSearch();
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (search.code && search.code === ADMIN_CODE) setAuthed(true);
  }, [search.code]);

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
        <div className="glass rounded-2xl p-6">
          <ShieldAlert className="h-6 w-6 text-warning" />
          <h1 className="mt-3 font-display text-2xl font-bold">Restricted area</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the admin access code.
          </p>
          <form
            className="mt-5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (code === ADMIN_CODE) setAuthed(true);
            }}
          >
            <Input
              type="password"
              autoFocus
              placeholder="Access code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button type="submit" className="gradient-brand text-white">
              Unlock
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Admin</div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        </div>
        <Button variant="outline" onClick={() => navigate({ to: "/" })}>
          Back to site
        </Button>
      </div>
      <Tabs defaultValue="analytics">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 h-auto p-1">
          <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="h-4 w-4" />Analytics</TabsTrigger>
          <TabsTrigger value="ads" className="gap-1.5"><Megaphone className="h-4 w-4" />Ads</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5"><Settings className="h-4 w-4" />Site</TabsTrigger>
          <TabsTrigger value="content" className="gap-1.5"><FileEdit className="h-4 w-4" />Content</TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5"><FileText className="h-4 w-4" />Reports</TabsTrigger>
          <TabsTrigger value="backups" className="gap-1.5"><DatabaseBackup className="h-4 w-4" />Backups</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
          <TabsContent value="ads"><AdsTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
          <TabsContent value="content"><ContentTab /></TabsContent>
          <TabsContent value="reports"><ReportsTab /></TabsContent>
          <TabsContent value="backups"><BackupsTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

/* -------- Tabs -------- */

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function AnalyticsTab() {
  const [a, setA] = useState(getAnalytics());
  const today = new Date().toISOString().slice(0, 10);

  const popAmount = useMemo(() => mode(a.amounts.map((n) => Math.round(n))), [a.amounts]);
  const popRate = useMemo(
    () => mode(a.rates.map((n) => Math.round(n * 4) / 4)),
    [a.rates],
  );
  const popCurrency = topKey(a.currencies) ?? "—";
  const popCalc = topKey(a.byCalculator) ?? "—";

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Stat label="Total visits" value={a.totalVisits} />
        <Stat label="Today's visits" value={a.visitsByDate[today] ?? 0} />
        <Stat label="Total calculations" value={a.totalCalcs} />
        <Stat label="Today's calculations" value={a.calcsByDate[today] ?? 0} />
        <Stat label="Most-used calculator" value={popCalc} />
        <Stat label="Most popular amount" value={popAmount != null ? String(popAmount) : "—"} />
        <Stat label="Most popular rate" value={popRate != null ? `${popRate}%` : "—"} />
        <Stat label="Most selected currency" value={popCurrency} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BreakdownCard title="Devices" data={a.devices} />
        <BreakdownCard title="Browsers" data={a.browsers} />
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Visitor sources & countries</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Not available in frontend-only mode — those require a server to capture
          referrer headers and resolve geo from IP. Enable a backend to track them.
        </p>
      </div>

      <Button
        variant="outline"
        onClick={() => {
          resetAnalytics();
          setA(getAnalytics());
        }}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Reset analytics
      </Button>
    </div>
  );
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      {entries.length === 0 ? (
        <div className="text-sm text-muted-foreground">No data yet.</div>
      ) : (
        <ul className="space-y-2">
          {entries.map(([k, v]) => (
            <li key={k} className="text-sm">
              <div className="flex items-center justify-between">
                <span>{k}</span>
                <span className="text-muted-foreground">{v}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full gradient-brand" style={{ width: `${(v / total) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdsTab() {
  const { refreshAds } = useApp();
  const [s, setS] = useState(getAds());
  return (
    <div className="grid gap-4 max-w-3xl">
      <div className="glass rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div className="font-display text-base font-semibold">Adsterra enabled</div>
          <div className="text-xs text-muted-foreground">
            When on, Calculate and Download PDF first open the direct link in a new tab.
          </div>
        </div>
        <Switch checked={s.enabled} onCheckedChange={(v) => setS({ ...s, enabled: v })} />
      </div>
      <div className="glass rounded-2xl p-5 grid gap-3">
        <div>
          <Label>Direct Link URL</Label>
          <Input
            placeholder="https://..."
            value={s.directLink}
            onChange={(e) => setS({ ...s, directLink: e.target.value })}
          />
        </div>
        <div>
          <Label>Cooldown (seconds)</Label>
          <Input
            type="number"
            value={s.cooldownSeconds}
            onChange={(e) => setS({ ...s, cooldownSeconds: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label>Banner ad HTML</Label>
            <Textarea
              rows={4}
              value={s.bannerHtml}
              onChange={(e) => setS({ ...s, bannerHtml: e.target.value })}
            />
          </div>
          <div>
            <Label>Native ad HTML</Label>
            <Textarea
              rows={4}
              value={s.nativeHtml}
              onChange={(e) => setS({ ...s, nativeHtml: e.target.value })}
            />
          </div>
          <div>
            <Label>Popunder ad HTML</Label>
            <Textarea
              rows={4}
              value={s.popunderHtml}
              onChange={(e) => setS({ ...s, popunderHtml: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="gradient-brand text-white"
            onClick={() => {
              setAds(s);
              refreshAds();
            }}
          >
            Save
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setAds(defaultAds);
              setS(defaultAds);
              refreshAds();
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const { refreshSite } = useApp();
  const [s, setS] = useState(getSite());
  return (
    <div className="glass rounded-2xl p-5 grid gap-3 max-w-2xl">
      <div>
        <Label>Website name</Label>
        <Input value={s.siteName} onChange={(e) => setS({ ...s, siteName: e.target.value })} />
      </div>
      <div>
        <Label>Contact email</Label>
        <Input value={s.contactEmail} onChange={(e) => setS({ ...s, contactEmail: e.target.value })} />
      </div>
      <div>
        <Label>SEO title</Label>
        <Input value={s.seoTitle} onChange={(e) => setS({ ...s, seoTitle: e.target.value })} />
      </div>
      <div>
        <Label>SEO description</Label>
        <Textarea
          rows={3}
          value={s.seoDescription}
          onChange={(e) => setS({ ...s, seoDescription: e.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <Button
          className="gradient-brand text-white"
          onClick={() => {
            setSite(s);
            refreshSite();
          }}
        >
          Save
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSite(defaultSite);
            setS(defaultSite);
            refreshSite();
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

function ContentTab() {
  const { refreshContent } = useApp();
  const [c, setC] = useState(getContent());
  return (
    <div className="grid gap-4 max-w-3xl">
      <div className="glass rounded-2xl p-5 grid gap-3">
        <div className="font-display text-base font-semibold">Hero</div>
        <Input
          value={c.hero.title}
          onChange={(e) => setC({ ...c, hero: { ...c.hero, title: e.target.value } })}
        />
        <Textarea
          rows={2}
          value={c.hero.subtitle}
          onChange={(e) => setC({ ...c, hero: { ...c.hero, subtitle: e.target.value } })}
        />
      </div>

      <PageBlock label="About page" value={c.about} onChange={(v) => setC({ ...c, about: v })} />
      <PageBlock label="Contact page" value={c.contact} onChange={(v) => setC({ ...c, contact: v })} />
      <PageBlock label="Privacy policy" value={c.privacy} onChange={(v) => setC({ ...c, privacy: v })} />
      <PageBlock label="Footer text" value={c.footer} onChange={(v) => setC({ ...c, footer: v })} rows={2} />

      <div className="glass rounded-2xl p-5 grid gap-3">
        <div className="flex items-center justify-between">
          <div className="font-display text-base font-semibold">FAQs</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setC({ ...c, faqs: [...c.faqs, { q: "", a: "" }] })}
          >
            Add FAQ
          </Button>
        </div>
        {c.faqs.map((f, i) => (
          <div key={i} className="grid gap-2 border-t border-border pt-3">
            <Input
              placeholder="Question"
              value={f.q}
              onChange={(e) => {
                const next = [...c.faqs];
                next[i] = { ...f, q: e.target.value };
                setC({ ...c, faqs: next });
              }}
            />
            <Textarea
              rows={2}
              placeholder="Answer"
              value={f.a}
              onChange={(e) => {
                const next = [...c.faqs];
                next[i] = { ...f, a: e.target.value };
                setC({ ...c, faqs: next });
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="justify-self-end"
              onClick={() => setC({ ...c, faqs: c.faqs.filter((_, idx) => idx !== i) })}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5 grid gap-3">
        <div className="flex items-center justify-between">
          <div className="font-display text-base font-semibold">Financial tips</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setC({ ...c, tips: [...c.tips, ""] })}
          >
            Add tip
          </Button>
        </div>
        {c.tips.map((t, i) => (
          <div key={i} className="flex gap-2">
            <Textarea
              rows={2}
              value={t}
              onChange={(e) => {
                const next = [...c.tips];
                next[i] = e.target.value;
                setC({ ...c, tips: next });
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setC({ ...c, tips: c.tips.filter((_, idx) => idx !== i) })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          className="gradient-brand text-white"
          onClick={() => {
            setContent(c);
            refreshContent();
          }}
        >
          Save content
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setContent(defaultContent);
            setC(defaultContent);
            refreshContent();
          }}
        >
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}

function PageBlock({
  label,
  value,
  onChange,
  rows = 6,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="glass rounded-2xl p-5 grid gap-2">
      <div className="font-display text-base font-semibold">{label}</div>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ReportsTab() {
  const hist = getHistory();
  const rows = hist.map((h) => ({
    when: new Date(h.ts).toISOString(),
    calculator: h.calculator,
    currency: h.currency,
    principal: h.result.principal,
    interest: h.result.interest,
    finalValue: h.result.finalValue,
    growthPct: h.result.growthPct,
  }));

  function exportCSV() {
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    download(`history-${Date.now()}.csv`, csv, "text/csv");
  }
  function exportXLSX() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "History");
    XLSX.writeFile(wb, `history-${Date.now()}.xlsx`);
  }
  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Calculation history", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["When", "Calc", "Currency", "Principal", "Interest", "Final", "Growth %"]],
      body: rows.map((r) => [
        r.when,
        r.calculator,
        r.currency,
        formatMoney(r.principal, r.currency as CurrencyCode),
        formatMoney(r.interest, r.currency as CurrencyCode),
        formatMoney(r.finalValue, r.currency as CurrencyCode),
        r.growthPct.toFixed(2) + "%",
      ]),
    });
    doc.save(`history-${Date.now()}.pdf`);
  }

  return (
    <div className="grid gap-4 max-w-3xl">
      <div className="glass rounded-2xl p-5">
        <div className="font-display text-base font-semibold">Calculation history ({hist.length})</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Export this browser's saved calculations.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={exportCSV} variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" /> CSV</Button>
          <Button onClick={exportXLSX} variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
          <Button onClick={exportPDF} variant="outline"><FileText className="mr-2 h-4 w-4" /> PDF</Button>
          <Button onClick={() => { clearHistory(); location.reload(); }} variant="ghost"><Trash2 className="mr-2 h-4 w-4" /> Clear history</Button>
        </div>
      </div>
    </div>
  );
}

function BackupsTab() {
  const [auto, setAuto] = useState(() => localStorage.getItem("dc.autoBackup") === "1");

  function snapshot() {
    const out: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("dc.")) out[k] = localStorage.getItem(k) ?? "";
    }
    return out;
  }

  function exportJSON() {
    const data = JSON.stringify(snapshot(), null, 2);
    download(`deposit-calculator-backup-${Date.now()}.json`, data, "application/json");
  }

  function importJSON(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result)) as Record<string, string>;
        Object.entries(obj).forEach(([k, v]) => localStorage.setItem(k, v));
        location.reload();
      } catch {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="grid gap-4 max-w-3xl">
      <div className="glass rounded-2xl p-5 grid gap-3">
        <div className="font-display text-base font-semibold">Manual backup</div>
        <p className="text-sm text-muted-foreground">
          Export everything Deposit Calculator stores in this browser (settings, ads, content, history, analytics) as a JSON file.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportJSON} className="gradient-brand text-white">
            <Download className="mr-2 h-4 w-4" /> Export backup
          </Button>
          <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            <Upload className="h-4 w-4" /> Restore from JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
            />
          </label>
        </div>
      </div>
      <div className="glass rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div className="font-display text-base font-semibold">Automatic daily backup</div>
          <div className="text-xs text-muted-foreground">
            Triggers a download once per day on first visit.
          </div>
        </div>
        <Switch
          checked={auto}
          onCheckedChange={(v) => {
            setAuto(v);
            localStorage.setItem("dc.autoBackup", v ? "1" : "0");
          }}
        />
      </div>
    </div>
  );
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
