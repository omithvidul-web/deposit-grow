import { useRef } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { formatMoney } from "@/lib/currency";
import { withAdGate } from "@/components/ads/AdsGate";

export function GrowthChart({
  series,
  exportRef,
}: {
  series: Array<{ t: number; label: string; value: number }>;
  exportRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = exportRef ?? localRef;
  const { currency } = useApp();

  const exportPng = async () => {
    if (!ref.current) return;
    const png = await toPng(ref.current, { cacheBust: true, pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = png;
    a.download = `growth-chart-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Investment growth
          </div>
          <div className="font-display text-sm font-semibold">Projected value over time</div>
        </div>
        <Button variant="outline" size="sm" onClick={withAdGate(exportPng)}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> PNG
        </Button>
      </div>
      <div ref={ref} className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--electric)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--growth)" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatMoney(Number(v), currency, { compact: true })}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
              formatter={(v) => formatMoney(Number(v), currency)}
              labelFormatter={(l) => `t = ${l}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--electric)"
              strokeWidth={2.5}
              fill="url(#gv)"
              isAnimationActive
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
