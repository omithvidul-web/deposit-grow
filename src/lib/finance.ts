// Financial calculation primitives. All amounts in major currency units.

export type PeriodUnit = "days" | "months" | "years";
export type FDMethod = "simple" | "compound";

export function periodInYears(value: number, unit: PeriodUnit): number {
  if (unit === "years") return value;
  if (unit === "months") return value / 12;
  return value / 365;
}

/** Simple interest: A = P + P*r*t */
export function simpleInterest(principal: number, ratePct: number, years: number) {
  const interest = (principal * ratePct * years) / 100;
  return { interest, finalValue: principal + interest };
}

/** Compound interest: A = P*(1 + r/n)^(n*t) */
export function compoundInterest(
  principal: number,
  ratePct: number,
  years: number,
  compoundsPerYear = 12,
) {
  const r = ratePct / 100;
  const n = compoundsPerYear;
  const finalValue = principal * Math.pow(1 + r / n, n * years);
  return { interest: finalValue - principal, finalValue };
}

export type CalcResult = {
  principal: number;
  interest: number;
  finalValue: number;
  totalProfit: number;
  monthlyEarnings: number;
  annualEarnings: number;
  growthPct: number;
  effectiveYieldPct: number;
  series: Array<{ t: number; label: string; value: number }>;
};

function makeSeries(
  principal: number,
  finalValue: number,
  years: number,
  fn: (yr: number) => number,
): Array<{ t: number; label: string; value: number }> {
  const steps = Math.max(8, Math.min(60, Math.round(years * 12)));
  const out: Array<{ t: number; label: string; value: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const yr = (i / steps) * years;
    const v = fn(yr);
    out.push({
      t: yr,
      label: years >= 1 ? `${yr.toFixed(1)}y` : `${(yr * 12).toFixed(1)}m`,
      value: Math.round(v * 100) / 100,
    });
  }
  // Guarantee endpoints exact
  if (out.length) {
    out[0].value = principal;
    out[out.length - 1].value = Math.round(finalValue * 100) / 100;
  }
  return out;
}

function derive(principal: number, finalValue: number, years: number): Omit<CalcResult, "series"> {
  const interest = finalValue - principal;
  const annualEarnings = years > 0 ? interest / years : 0;
  const monthlyEarnings = annualEarnings / 12;
  const growthPct = principal > 0 ? (interest / principal) * 100 : 0;
  const effectiveYieldPct =
    principal > 0 && years > 0 ? (Math.pow(finalValue / principal, 1 / years) - 1) * 100 : 0;
  return {
    principal,
    interest,
    finalValue,
    totalProfit: interest,
    monthlyEarnings,
    annualEarnings,
    growthPct,
    effectiveYieldPct,
  };
}

export function calcFD(input: {
  principal: number;
  ratePct: number;
  period: number;
  unit: PeriodUnit;
  method: FDMethod;
  compoundsPerYear?: number;
}): CalcResult {
  const years = periodInYears(input.period, input.unit);
  const n = input.compoundsPerYear ?? 12;
  const { finalValue } =
    input.method === "simple"
      ? simpleInterest(input.principal, input.ratePct, years)
      : compoundInterest(input.principal, input.ratePct, years, n);
  const series = makeSeries(input.principal, finalValue, years, (yr) =>
    input.method === "simple"
      ? simpleInterest(input.principal, input.ratePct, yr).finalValue
      : compoundInterest(input.principal, input.ratePct, yr, n).finalValue,
  );
  return { ...derive(input.principal, finalValue, years), series };
}

export function calcTD(input: {
  principal: number;
  ratePct: number;
  period: number;
  unit: PeriodUnit;
}): CalcResult {
  const years = periodInYears(input.period, input.unit);
  const { finalValue } = compoundInterest(input.principal, input.ratePct, years, 12);
  const series = makeSeries(input.principal, finalValue, years, (yr) =>
    compoundInterest(input.principal, input.ratePct, yr, 12).finalValue,
  );
  return { ...derive(input.principal, finalValue, years), series };
}

export function calcSD(input: {
  opening: number;
  monthlyDeposit: number;
  ratePct: number;
  period: number;
  unit: PeriodUnit;
}): CalcResult {
  const years = periodInYears(input.period, input.unit);
  const months = Math.max(0, Math.round(years * 12));
  const i = input.ratePct / 100 / 12;
  const fv = (m: number) => {
    if (i === 0) return input.opening + input.monthlyDeposit * m;
    return (
      input.opening * Math.pow(1 + i, m) +
      input.monthlyDeposit * ((Math.pow(1 + i, m) - 1) / i)
    );
  };
  const finalValue = fv(months);
  const totalDeposited = input.opening + input.monthlyDeposit * months;
  const series: Array<{ t: number; label: string; value: number }> = [];
  const steps = Math.min(months, 60);
  for (let s = 0; s <= steps; s++) {
    const m = Math.round((s / steps) * months);
    series.push({
      t: m / 12,
      label: months >= 12 ? `${(m / 12).toFixed(1)}y` : `${m}m`,
      value: Math.round(fv(m) * 100) / 100,
    });
  }
  // Override the derive() base since principal for growth% is what was deposited overall
  const interest = finalValue - totalDeposited;
  const annualEarnings = years > 0 ? interest / years : 0;
  return {
    principal: totalDeposited,
    interest,
    finalValue,
    totalProfit: interest,
    monthlyEarnings: annualEarnings / 12,
    annualEarnings,
    growthPct: totalDeposited > 0 ? (interest / totalDeposited) * 100 : 0,
    effectiveYieldPct:
      totalDeposited > 0 && years > 0
        ? (Math.pow(finalValue / totalDeposited, 1 / years) - 1) * 100
        : 0,
    series,
  };
}

/** Years to double a principal at a compound rate (rule of finance, exact). */
export function yearsToDouble(ratePct: number, n = 12): number {
  if (ratePct <= 0) return Infinity;
  const r = ratePct / 100;
  return Math.log(2) / (n * Math.log(1 + r / n));
}

/** Years to reach a target from a principal at compound rate. */
export function yearsToTarget(principal: number, target: number, ratePct: number, n = 12) {
  if (principal <= 0 || target <= principal || ratePct <= 0) return Infinity;
  const r = ratePct / 100;
  return Math.log(target / principal) / (n * Math.log(1 + r / n));
}

/** Monthly contribution required to hit target from opening over months at annual rate. */
export function requiredMonthlyContribution(
  opening: number,
  target: number,
  ratePct: number,
  months: number,
) {
  if (months <= 0) return Infinity;
  const i = ratePct / 100 / 12;
  if (i === 0) return Math.max(0, (target - opening) / months);
  const fvOpening = opening * Math.pow(1 + i, months);
  const remaining = target - fvOpening;
  if (remaining <= 0) return 0;
  return remaining / ((Math.pow(1 + i, months) - 1) / i);
}
