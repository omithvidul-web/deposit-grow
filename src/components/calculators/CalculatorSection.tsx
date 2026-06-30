import { useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalculatorForm,
  FD_DEFAULTS,
  type FDInputs,
} from "./CalculatorForm";
import { SDForm, SD_DEFAULTS, type SDInputs } from "./SDForm";
import { ResultCard } from "./ResultCard";
import { GrowthChart } from "./GrowthChart";
import { RateComparison } from "./RateComparison";
import { PlanComparison } from "./PlanComparison";
import { BreakEvenPanel } from "./BreakEvenPanel";
import { SmartInsights } from "./SmartInsights";
import { calcFD, calcSD, type CalcResult } from "@/lib/finance";
import { generateInsights } from "@/lib/insights";
import { useApp } from "@/contexts/AppContext";
import { withAdGate } from "@/components/ads/AdsGate";
import { buildReportPdf } from "@/lib/pdf";
import { toPng } from "html-to-image";
import { formatMoney, formatPct } from "@/lib/currency";
import { TrendingUp, Wallet, PiggyBank } from "lucide-react";

type Tab = "FD" | "TD" | "SD";

export function CalculatorSection() {
  const { currency } = useApp();
  const [tab, setTab] = useState<Tab>("FD");

  const [fd, setFd] = useState<FDInputs>(FD_DEFAULTS);
  const [td, setTd] = useState<FDInputs>({ ...FD_DEFAULTS, method: "compound", ratePct: 7 });
  const [sd, setSd] = useState<SDInputs>(SD_DEFAULTS);

  const [resFD, setResFD] = useState<CalcResult | null>(null);
  const [resTD, setResTD] = useState<CalcResult | null>(null);
  const [resSD, setResSD] = useState<CalcResult | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);

  const activeResult: CalcResult | null =
    tab === "FD" ? resFD : tab === "TD" ? resTD : resSD;

  const insights = useMemo(() => {
    if (!activeResult) return [];
    if (tab === "FD") {
      return generateInsights({
        result: activeResult,
        ratePct: fd.ratePct,
        period: fd.period,
        unit: fd.unit,
        principal: fd.principal,
        method: fd.method,
        currency,
      });
    }
    if (tab === "TD") {
      return generateInsights({
        result: activeResult,
        ratePct: td.ratePct,
        period: td.period,
        unit: td.unit,
        principal: td.principal,
        method: "compound",
        currency,
      });
    }
    return generateInsights({
      result: activeResult,
      ratePct: sd.ratePct,
      period: sd.period,
      unit: sd.unit,
      principal: sd.opening + sd.monthlyDeposit * 12 * (sd.unit === "years" ? sd.period : sd.period / 12),
      currency,
    });
  }, [tab, activeResult, fd, td, sd, currency]);

  async function handleDownload() {
    const r = activeResult;
    if (!r) return;
    let chartPng: string | undefined;
    if (chartRef.current) {
      try {
        chartPng = await toPng(chartRef.current, { cacheBust: true, pixelRatio: 2 });
      } catch {
        /* ignore */
      }
    }
    const inputs: Array<[string, string]> =
      tab === "SD"
        ? [
            ["Opening balance", formatMoney(sd.opening, currency)],
            ["Monthly deposit", formatMoney(sd.monthlyDeposit, currency)],
            ["Interest rate", formatPct(sd.ratePct, 2)],
            ["Period", `${sd.period} ${sd.unit}`],
            ["Currency", currency],
          ]
        : [
            ["Deposit amount", formatMoney((tab === "FD" ? fd : td).principal, currency)],
            ["Interest rate", formatPct((tab === "FD" ? fd : td).ratePct, 2)],
            ["Period", `${(tab === "FD" ? fd : td).period} ${(tab === "FD" ? fd : td).unit}`],
            ["Method", tab === "FD" ? fd.method : "compound"],
            ["Currency", currency],
          ];

    // Rate comparison table for the PDF
    let cmp: Array<[string, string, string, string]> | undefined;
    if (tab !== "SD") {
      const cur = tab === "FD" ? fd : td;
      const method = tab === "FD" ? fd.method : "compound";
      const base = calcFD({ ...cur, method });
      cmp = [-2, -1, 0, 1, 2].map((d) => {
        const c = calcFD({ ...cur, ratePct: cur.ratePct + d, method });
        return [
          formatPct(cur.ratePct + d, 2),
          formatMoney(c.interest, currency),
          formatMoney(c.finalValue, currency),
          d === 0 ? "—" : formatMoney(c.finalValue - base.finalValue, currency),
        ];
      });
    }

    await buildReportPdf({
      title:
        tab === "FD"
          ? "Fixed Deposit Report"
          : tab === "TD"
            ? "Term Deposit Report"
            : "Savings Deposit Report",
      calculator: tab,
      currency,
      inputs,
      result: r,
      comparisonRows: cmp,
      chartPng,
    });
  }

  const onCalculate = (r: CalcResult) => {
    if (tab === "FD") setResFD(r);
    else if (tab === "TD") setResTD(r);
    else setResSD(r);
  };

  return (
    <section className="grid gap-6">
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="FD" className="py-2.5 gap-1.5">
            <TrendingUp className="h-4 w-4" /> Fixed Deposit
          </TabsTrigger>
          <TabsTrigger value="TD" className="py-2.5 gap-1.5">
            <Wallet className="h-4 w-4" /> Term Deposit
          </TabsTrigger>
          <TabsTrigger value="SD" className="py-2.5 gap-1.5">
            <PiggyBank className="h-4 w-4" /> Savings Deposit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="FD" className="mt-5">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            <div className="glass rounded-2xl p-5">
              <CalculatorForm
                variant="FD"
                inputs={fd}
                setInputs={setFd as never}
                hasResult={!!resFD}
                onResult={withAdGate(() => {
                  onCalculate(calcFD(fd));
                })}
                onDownload={withAdGate(handleDownload)}
              />
            </div>
            <ResultsArea result={resFD} chartRef={chartRef} insights={insights} />
          </div>
        </TabsContent>

        <TabsContent value="TD" className="mt-5">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            <div className="glass rounded-2xl p-5">
              <CalculatorForm
                variant="TD"
                inputs={td}
                setInputs={setTd as never}
                hasResult={!!resTD}
                onResult={withAdGate(() => {
                  onCalculate(calcFD({ ...td, method: "compound" }));
                })}
                onDownload={withAdGate(handleDownload)}
              />
            </div>
            <ResultsArea result={resTD} chartRef={chartRef} insights={insights} />
          </div>
        </TabsContent>

        <TabsContent value="SD" className="mt-5">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            <div className="glass rounded-2xl p-5">
              <SDForm
                inputs={sd}
                setInputs={setSd}
                hasResult={!!resSD}
                onResult={withAdGate(() => {
                  onCalculate(calcSD(sd));
                })}
                onDownload={withAdGate(handleDownload)}
              />
            </div>
            <ResultsArea result={resSD} chartRef={chartRef} insights={insights} />
          </div>
        </TabsContent>
      </Tabs>

      {activeResult && tab !== "SD" && (
        <RateComparison
          principal={(tab === "FD" ? fd : td).principal}
          ratePct={(tab === "FD" ? fd : td).ratePct}
          period={(tab === "FD" ? fd : td).period}
          unit={(tab === "FD" ? fd : td).unit}
          method={tab === "FD" ? fd.method : "compound"}
        />
      )}

      {activeResult && (
        <BreakEvenPanel
          principal={
            tab === "SD" ? sd.opening : (tab === "FD" ? fd : td).principal
          }
          ratePct={tab === "SD" ? sd.ratePct : (tab === "FD" ? fd : td).ratePct}
        />
      )}

      <PlanComparison
        seed={
          tab !== "SD"
            ? {
                principal: (tab === "FD" ? fd : td).principal,
                ratePct: (tab === "FD" ? fd : td).ratePct,
                period: (tab === "FD" ? fd : td).period,
                unit: (tab === "FD" ? fd : td).unit,
              }
            : undefined
        }
      />
    </section>
  );
}

function ResultsArea({
  result,
  chartRef,
  insights,
}: {
  result: CalcResult | null;
  chartRef: React.RefObject<HTMLDivElement | null>;
  insights: string[];
}) {
  if (!result) {
    return (
      <div className="glass rounded-2xl p-8 flex items-center justify-center text-center text-sm text-muted-foreground min-h-[280px]">
        Enter your numbers and press <span className="mx-1 font-semibold text-foreground">Calculate</span> to see your projected return.
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      <ResultCard result={result} />
      <div ref={chartRef}>
        <GrowthChart series={result.series} />
      </div>
      <SmartInsights insights={insights} />
    </div>
  );
}
