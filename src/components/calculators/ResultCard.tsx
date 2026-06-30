import { useApp } from "@/contexts/AppContext";
import { formatMoney, formatPct } from "@/lib/currency";
import type { CalcResult } from "@/lib/finance";
import { CountUp } from "@/components/CountUp";
import { motion } from "framer-motion";

const tiles: Array<{
  key: keyof CalcResult | "principal" | "effectiveYieldPct" | "growthPct";
  label: string;
  pct?: boolean;
  accent?: string;
}> = [
  { key: "principal", label: "Principal" },
  { key: "interest", label: "Interest" },
  { key: "totalProfit", label: "Total Profit", accent: "text-success" },
  { key: "finalValue", label: "Final Value", accent: "text-gradient-brand" },
  { key: "effectiveYieldPct", label: "Effective Yield", pct: true },
  { key: "growthPct", label: "Growth", pct: true, accent: "text-success" },
];

export function ResultCard({ result }: { result: CalcResult }) {
  const { currency } = useApp();
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {tiles.map((t, i) => {
        const v = result[t.key as keyof CalcResult] as number;
        return (
          <motion.div
            key={t.key as string}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl p-4"
          >
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {t.label}
            </div>
            <div
              className={`mt-1 font-display text-xl font-semibold md:text-2xl ${t.accent ?? ""}`}
            >
              <CountUp
                value={v}
                format={(x) => (t.pct ? formatPct(x, 2) : formatMoney(x, currency))}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
