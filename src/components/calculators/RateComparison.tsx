import { calcFD, type FDMethod, type PeriodUnit } from "@/lib/finance";
import { formatMoney, formatPct } from "@/lib/currency";
import { useApp } from "@/contexts/AppContext";

export function RateComparison({
  principal,
  ratePct,
  period,
  unit,
  method,
}: {
  principal: number;
  ratePct: number;
  period: number;
  unit: PeriodUnit;
  method: FDMethod;
}) {
  const { currency } = useApp();
  const deltas = [-2, -1, 0, 1, 2];
  const rows = deltas.map((d) => {
    const r = ratePct + d;
    const calc = calcFD({ principal, ratePct: r, period, unit, method });
    return { d, rate: r, ...calc };
  });
  const base = rows.find((r) => r.d === 0)!;
  const best = rows.reduce((a, b) => (b.finalValue > a.finalValue ? b : a));

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Interest rate comparison
        </div>
        <div className="font-display text-sm font-semibold">
          What happens at ±1% and ±2%
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-2 py-2">Rate</th>
              <th className="px-2 py-2">Interest earned</th>
              <th className="px-2 py-2">Final value</th>
              <th className="px-2 py-2">Difference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.d}
                className={`border-t border-border ${
                  r.rate === best.rate ? "bg-success/10" : ""
                }`}
              >
                <td className="px-2 py-2 font-medium">
                  {formatPct(r.rate, 2)}
                  {r.d === 0 && <span className="ml-1 text-xs text-muted-foreground">(current)</span>}
                </td>
                <td className="px-2 py-2">{formatMoney(r.interest, currency)}</td>
                <td className="px-2 py-2">{formatMoney(r.finalValue, currency)}</td>
                <td className="px-2 py-2">
                  {r.d === 0
                    ? "—"
                    : `${r.finalValue - base.finalValue >= 0 ? "+" : ""}${formatMoney(r.finalValue - base.finalValue, currency)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
