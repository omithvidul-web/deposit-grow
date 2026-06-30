export const CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "EUR", label: "Euro", symbol: "€", locale: "de-DE" },
  { code: "GBP", label: "British Pound", symbol: "£", locale: "en-GB" },
  { code: "INR", label: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  { code: "LKR", label: "Sri Lankan Rupee", symbol: "Rs", locale: "en-LK" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$", locale: "en-AU" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function getCurrency(code: CurrencyCode) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function formatMoney(value: number, code: CurrencyCode, opts?: { compact?: boolean }) {
  if (!Number.isFinite(value)) return "—";
  const c = getCurrency(code);
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: opts?.compact ? 1 : 2,
      notation: opts?.compact ? "compact" : "standard",
    }).format(value);
  } catch {
    return `${c.symbol} ${value.toFixed(2)}`;
  }
}

export function formatPct(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}
