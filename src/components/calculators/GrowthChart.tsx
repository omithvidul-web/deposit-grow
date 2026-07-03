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

  const resolveVar = (name: string, fallback: string) => {
    if (typeof window === "undefined") return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  };

  // Resolve to concrete colors so html-to-image serializes them correctly in SVG.
  const electric = resolveVar("--electric", "#2563eb");
  const growth = resolveVar("--growth", "#10b981");
  const border = resolveVar("--border", "#e5e7eb");
  const axis = resolveVar("--muted-foreground", "#6b7280");

  const exportPng = async () => {
    if (!ref.current) return;
    const png = await toPng(ref.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
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
      <div ref={ref} className="h-[280px] w-full bg-white p-2 rounded-xl">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={electric} stopOpacity={0.55} />
                <stop offset="100%" stopColor={growth} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={border} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatMoney(Number(v), currency, { compact: true })}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: `1px solid ${border}`,
                borderRadius: 12,
                fontSize: 12,
                color: "#111827",
              }}
              formatter={(v) => formatMoney(Number(v), currency)}
              labelFormatter={(l) => `t = ${l}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={electric}
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
