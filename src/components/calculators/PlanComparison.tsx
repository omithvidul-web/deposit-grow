import { useState } from "react";
import { calcFD, type FDMethod, type PeriodUnit } from "@/lib/finance";
import { formatMoney, formatPct } from "@/lib/currency";
import { useApp } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Plan = {
  name: string;
  principal: number;
  ratePct: number;
  period: number;
  unit: PeriodUnit;
  method: FDMethod;
};

export function PlanComparison({ seed }: { seed?: Partial<Plan> }) {
  const { currency } = useApp();
  const [plans, setPlans] = useState<Plan[]>([
    {
      name: "Plan A",
      principal: seed?.principal ?? 10000,
      ratePct: seed?.ratePct ?? 5,
      period: seed?.period ?? 3,
      unit: seed?.unit ?? "years",
      method: "compound",
    },
    {
      name: "Plan B",
      principal: seed?.principal ?? 10000,
      ratePct: (seed?.ratePct ?? 5) + 1,
      period: (seed?.period ?? 3) + 1,
      unit: seed?.unit ?? "years",
      method: "compound",
    },
    {
      name: "Plan C",
      principal: seed?.principal ?? 10000,
      ratePct: (seed?.ratePct ?? 5) + 2,
      period: seed?.period ?? 3,
      unit: seed?.unit ?? "years",
      method: "simple",
    },
  ]);

  const calculated = plans.map((p) => ({ p, c: calcFD(p) }));
  const best = calculated.reduce((a, b) => (b.c.finalValue > a.c.finalValue ? b : a));

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Compare plans
        </div>
        <div className="font-display text-sm font-semibold">Three side-by-side scenarios</div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {calculated.map(({ p, c }, idx) => {
          const isBest = p === best.p;
          return (
            <div
              key={idx}
              className={`rounded-xl border p-3 ${
                isBest ? "border-success bg-success/10" : "border-border bg-background/40"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <Input
                  className="h-8 text-sm font-semibold"
                  value={p.name}
                  onChange={(e) => {
                    const next = [...plans];
                    next[idx] = { ...p, name: e.target.value };
                    setPlans(next);
                  }}
                />
                {isBest && (
                  <span className="ml-2 rounded-full bg-success px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success-foreground">
                    Best
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] uppercase">Deposit</Label>
                  <Input
                    type="number"
                    value={p.principal}
                    onChange={(e) => {
                      const next = [...plans];
                      next[idx] = { ...p, principal: Number(e.target.value) || 0 };
                      setPlans(next);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase">Rate %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={p.ratePct}
                    onChange={(e) => {
                      const next = [...plans];
                      next[idx] = { ...p, ratePct: Number(e.target.value) || 0 };
                      setPlans(next);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase">Period</Label>
                  <Input
                    type="number"
                    value={p.period}
                    onChange={(e) => {
                      const next = [...plans];
                      next[idx] = { ...p, period: Number(e.target.value) || 0 };
                      setPlans(next);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase">Unit</Label>
                  <Select
                    value={p.unit}
                    onValueChange={(v) => {
                      const next = [...plans];
                      next[idx] = { ...p, unit: v as PeriodUnit };
                      setPlans(next);
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Interest</div>
                  <div className="font-semibold">{formatMoney(c.interest, currency)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Final</div>
                  <div className="font-semibold">{formatMoney(c.finalValue, currency)}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground">Growth</div>
                  <div className="font-semibold text-success">{formatPct(c.growthPct, 1)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
