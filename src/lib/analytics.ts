import { lsGet, lsSet } from "./storage";

const K = "dc.analytics.v1";

export type AnalyticsState = {
  totalVisits: number;
  visitsByDate: Record<string, number>;
  totalCalcs: number;
  calcsByDate: Record<string, number>;
  byCalculator: Record<string, number>;
  amounts: number[]; // last N amounts
  rates: number[]; // last N rates
  currencies: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  lastVisitDate: string | null;
};

const empty: AnalyticsState = {
  totalVisits: 0,
  visitsByDate: {},
  totalCalcs: 0,
  calcsByDate: {},
  byCalculator: {},
  amounts: [],
  rates: [],
  currencies: {},
  devices: {},
  browsers: {},
  lastVisitDate: null,
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function detectDevice(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (/Tablet|iPad/i.test(ua)) return "Tablet";
  if (/Mobile|Android|iPhone/i.test(ua)) return "Mobile";
  return "Desktop";
}

function detectBrowser(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  return "Other";
}

export function getAnalytics(): AnalyticsState {
  return { ...empty, ...lsGet(K, empty) };
}

export function setAnalytics(s: AnalyticsState) {
  lsSet(K, s);
}

export function trackVisit() {
  const s = getAnalytics();
  const t = today();
  if (s.lastVisitDate !== t) {
    s.totalVisits += 1;
    s.visitsByDate[t] = (s.visitsByDate[t] ?? 0) + 1;
    s.lastVisitDate = t;
    const d = detectDevice();
    const b = detectBrowser();
    s.devices[d] = (s.devices[d] ?? 0) + 1;
    s.browsers[b] = (s.browsers[b] ?? 0) + 1;
    setAnalytics(s);
  }
}

export function trackCalc(args: {
  calculator: string;
  amount: number;
  rate: number;
  currency: string;
}) {
  const s = getAnalytics();
  const t = today();
  s.totalCalcs += 1;
  s.calcsByDate[t] = (s.calcsByDate[t] ?? 0) + 1;
  s.byCalculator[args.calculator] = (s.byCalculator[args.calculator] ?? 0) + 1;
  s.amounts = [...s.amounts.slice(-199), args.amount];
  s.rates = [...s.rates.slice(-199), args.rate];
  s.currencies[args.currency] = (s.currencies[args.currency] ?? 0) + 1;
  setAnalytics(s);
}

export function resetAnalytics() {
  setAnalytics(empty);
}

export function mode<T extends string | number>(arr: T[]): T | null {
  if (!arr.length) return null;
  const counts = new Map<T, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: T | null = null;
  let bestC = -1;
  for (const [k, c] of counts) if (c > bestC) {
    best = k;
    bestC = c;
  }
  return best;
}

export function topKey(rec: Record<string, number>): string | null {
  const entries = Object.entries(rec);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
