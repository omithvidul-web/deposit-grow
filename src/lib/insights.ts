import { calcFD, type CalcResult, type FDMethod, type PeriodUnit } from "./finance";
import { formatMoney, formatPct, type CurrencyCode } from "./currency";

export function generateInsights(args: {
  result: CalcResult;
  ratePct: number;
  period: number;
  unit: PeriodUnit;
  principal: number;
  method?: FDMethod;
  currency: CurrencyCode;
}): string[] {
  const { result, ratePct, period, unit, principal, currency, method } = args;
  const out: string[] = [];

  out.push(
    `Your investment grows by ${formatPct(result.growthPct, 1)} over the chosen period, earning ${formatMoney(result.totalProfit, currency)}.`,
  );

  // +1% comparison
  if (method) {
    const plus1 = calcFD({
      principal,
      ratePct: ratePct + 1,
      period,
      unit,
      method,
    });
    const delta = plus1.totalProfit - result.totalProfit;
    if (delta > 0) {
      out.push(
        `Raising the rate by 1% would earn an extra ${formatMoney(delta, currency)} — about ${formatPct((delta / Math.max(1, result.totalProfit)) * 100, 1)} more profit.`,
      );
    }

    // simple vs compound
    const other: FDMethod = method === "compound" ? "simple" : "compound";
    const alt = calcFD({ principal, ratePct, period, unit, method: other });
    const diff = result.totalProfit - alt.totalProfit;
    if (Math.abs(diff) > 1) {
      const better = diff > 0 ? method : other;
      out.push(
        `${better === "compound" ? "Compound" : "Simple"} interest produces a higher return for these inputs (difference: ${formatMoney(Math.abs(diff), currency)}).`,
      );
    }
  }

  // effective yield
  out.push(
    `Effective annual yield works out to ${formatPct(result.effectiveYieldPct, 2)} — useful when comparing across different compounding methods.`,
  );

  // monthly cashflow
  if (result.monthlyEarnings > 0) {
    out.push(
      `On average you earn ${formatMoney(result.monthlyEarnings, currency)} per month and ${formatMoney(result.annualEarnings, currency)} per year.`,
    );
  }

  return out;
}
