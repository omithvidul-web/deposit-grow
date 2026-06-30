import { useState } from "react";
import {
  yearsToDouble,
  yearsToTarget,
  requiredMonthlyContribution,
} from "@/lib/finance";
import { formatMoney } from "@/lib/currency";
import { useApp } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BreakEvenPanel({
  principal,
  ratePct,
}: {
  principal: number;
  ratePct: number;
}) {
  const { currency } = useApp();
  const [target, setTarget] = useState(Math.max(principal * 2, principal + 5000));
  const [months, setMonths] = useState(36);

  const doubleYears = yearsToDouble(ratePct);
  const targetYears = yearsToTarget(principal, target, ratePct);
  const required = requiredMonthlyContribution(principal, target, ratePct, months);

  function fmtYears(y: number) {
    if (!Number.isFinite(y)) return "∞";
    const wholeYears = Math.floor(y);
    const m = Math.round((y - wholeYears) * 12);
    if (wholeYears === 0) return `${m} months`;
    return m === 0 ? `${wholeYears} years` : `${wholeYears}y ${m}m`;
  }
  function targetDate(years: number) {
    if (!Number.isFinite(years)) return "—";
    const d = new Date();
    d.setMonth(d.getMonth() + Math.round(years * 12));
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
  }

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Break-even analysis
        </div>
        <div className="font-display text-sm font-semibold">When does the money work?</div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border p-3">
          <div className="text-xs text-muted-foreground">Time to double</div>
          <div className="mt-1 font-display text-xl font-semibold">{fmtYears(doubleYears)}</div>
          <div className="text-xs text-muted-foreground">at {ratePct.toFixed(2)}%</div>
        </div>
        <div className="rounded-xl border border-border p-3">
          <div className="text-xs text-muted-foreground">Reach target</div>
          <Label className="mt-2 block text-[10px] uppercase">Target amount</Label>
          <Input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value) || 0)}
          />
          <div className="mt-2 text-xs">
            Time: <span className="font-semibold">{fmtYears(targetYears)}</span>
            <span className="ml-2 text-muted-foreground">({targetDate(targetYears)})</span>
          </div>
        </div>
        <div className="rounded-xl border border-border p-3">
          <div className="text-xs text-muted-foreground">Required monthly</div>
          <Label className="mt-2 block text-[10px] uppercase">Over months</Label>
          <Input
            type="number"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value) || 0)}
          />
          <div className="mt-2 text-xs">
            Contribution:{" "}
            <span className="font-semibold">
              {Number.isFinite(required) ? formatMoney(required, currency) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
