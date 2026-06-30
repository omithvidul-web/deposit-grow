
# Deposit Calculator — Build Plan

A premium fintech-style calculator site built as a **pure frontend** TanStack Start app. All state (history, settings, Adsterra config, admin content) lives in `localStorage`. No database, no auth, no real visitor analytics.

## Stack

- TanStack Start (already wired) + React + Tailwind v4 + shadcn/ui
- Recharts (charts) · jsPDF + jspdf-autotable (PDF) · framer-motion (animations) · zod (validation)
- Logo: the uploaded chart-arrow image, uploaded via lovable-assets

## Routes

```
/                  Home (hero + 3 calculator tabs + features + tips + FAQ + about + contact)
/about             About page
/contact           Contact page (static form, mailto)
/privacy           Privacy Policy
/admin             Hidden admin dashboard (only reachable via secret code)
```

Each route gets its own `head()` metadata (title, description, og:*, canonical). Root supplies sitewide defaults + Organization JSON-LD; FAQ JSON-LD on home. `public/robots.txt` and `public/sitemap.xml` included.

## Design system

Premium banking / fintech aesthetic taken from the logo:
- Deep navy `#0B1F3A`, electric blue `#2563EB`, growth green `#10B981`, soft white `#F7FAFC`
- Glassmorphism cards (`bg-white/60 backdrop-blur-xl` light · `bg-white/5` dark)
- Inter + Space Grotesk via `@fontsource`
- Light + dark mode toggle (class strategy, persisted)
- Mobile-first, generous spacing, soft shadows, rounded-2xl cards, animated counters

All colors as semantic tokens in `src/styles.css` (`@theme inline`). Shadcn components themed off these.

## Core components

- `Header` — logo + nav + theme toggle + currency selector
- `Footer` — links, tagline "Calculate. Compare. Grow."
- `CurrencyContext` — USD (default), EUR, GBP, INR, LKR, AUD; persisted
- `CalculatorTabs` — FD / TD / SD switcher
- `FDForm`, `TDForm`, `SDForm` — inputs with validation
- `ResultCard` — Principal, Interest, Total Profit, Final Value, Effective Yield, Growth % with animated count-up
- `GrowthChart` — Recharts line chart, tooltips, "Export PNG" button (html-to-image)
- `RateComparison` — table for −2, −1, current, +1, +2 with best-row highlight
- `PlanComparison` — up to 3 plans side-by-side, highlight best
- `BreakEvenPanel` — doubling time, target-date, required monthly contribution
- `SmartInsights` — auto-generated bullet insights
- `HistoryPanel` — last 20 calcs in localStorage; reload / delete / clear
- `AdsterraGate` — intercepts Calculate & Download PDF clicks; if enabled+cooldown elapsed, saves inputs to localStorage, opens direct link in new tab, immediately resumes the action on return (no re-entry needed). Cooldown timestamp in localStorage.
- `PdfReport` — jsPDF report with details, interest breakdown, comparison table, growth chart snapshot, timestamp, logo

## Calculators (math)

- **FD**: choose Simple or Compound; period in Days/Months/Years
  - Simple: `A = P + P·r·t`
  - Compound: `A = P·(1 + r/n)^(n·t)` (n = 12 by default; configurable as monthly)
- **TD**: compound monthly (typical term deposit)
- **SD**: opening balance + recurring monthly deposit, monthly compounding
  - `A = P·(1+i)^n + PMT·((1+i)^n − 1)/i`
- Derived: monthly/annual earnings, total profit, growth %, effective annual yield

All math in `src/lib/finance.ts` with unit-friendly pure functions.

## Hidden admin (secret code `060245`)

- Entering `060245` in any calculator's **Deposit Amount** then pressing Calculate cancels the calc and navigates to `/admin`.
- Admin gate at `/admin` requires the same code in a passphrase field if visited directly. Code lives in `import.meta.env.VITE_ADMIN_CODE` (default `060245`) — note: this is client-side only since the app is frontend-only, so it is obfuscation, not real security. The plan flags this honestly to the user.

### Admin dashboard tabs

All data is localStorage-backed; "analytics" reflects local usage only.

1. **Analytics** — total calculations, daily calculations, most-used calculator, most-popular amount/rate/currency, simple device/browser detection (from `navigator.userAgent`). Total/today visitors counted via localStorage on first load per day. Countries & traffic sources shown as "Not available in frontend-only mode" with explanation.
2. **Ads** — Adsterra direct link, enable/disable toggle, cooldown (seconds), banner/native/popunder script slots. Stored in localStorage; rendered site-wide via `<AdSlots>`.
3. **Site settings** — site name, logo upload (data URL), favicon, contact email, theme default, SEO title/description.
4. **Content** — editable rich text for Home hero, About, Contact, Privacy, FAQ items (add/edit/delete), footer text. Stored in localStorage; pages read from this store with sensible fallbacks.
5. **Reports** — export history as CSV / Excel (.xlsx via SheetJS) / PDF.
6. **Backups** — manual export of entire localStorage as JSON, restore from JSON, plus an "auto daily" toggle that triggers an in-browser download once per day on first visit.

## Adsterra flow

1. User clicks Calculate / Download PDF.
2. `AdsterraGate` checks: enabled? cooldown elapsed? direct link set?
3. If yes → snapshot form values + pending action to `localStorage`, open direct link (new tab), set cooldown timestamp, and immediately execute the original action in the current tab (so the user never loses progress on return).
4. If no → run action directly.

Restoring values on return is automatic since they were never cleared.

## SEO

- Per-route `head()` with title, description, og:*, canonical (relative paths — no domain yet)
- Root: Organization + WebSite JSON-LD
- Home: FAQPage JSON-LD generated from FAQ content
- `public/robots.txt` (allow all)
- `public/sitemap.xml` with placeholder base URL + TODO comment

## What this plan does NOT include (honest call-outs)

- **No real server**: visitor counts, geo, traffic sources, and ad analytics are limited to what a browser can self-report. "Most popular X across all users" is actually "across this browser."
- **Admin code is client-side**: `060245` is obfuscated, not secret. Anyone with devtools can find it. Real protection requires a backend — happy to add Lovable Cloud later.
- **PWA, image optimization, lazy-loaded routes** done where TanStack Start supports it out of the box; no service worker beyond a basic manifest unless you want it.
- **Excel export** via SheetJS community build.

## File layout

```
src/
  routes/{index,about,contact,privacy,admin}.tsx
  components/
    layout/{Header,Footer,ThemeToggle,CurrencySelect}.tsx
    calculators/{FDForm,TDForm,SDForm,ResultCard,GrowthChart,
                 RateComparison,PlanComparison,BreakEven,SmartInsights}.tsx
    history/HistoryPanel.tsx
    ads/{AdsterraGate,AdSlots}.tsx
    admin/{AdminGate,AnalyticsTab,AdsTab,SettingsTab,ContentTab,ReportsTab,BackupsTab}.tsx
    ui/...                  (shadcn)
  lib/
    finance.ts              (all math)
    currency.ts             (formatters, symbols)
    storage.ts              (typed localStorage helpers)
    pdf.ts                  (jsPDF report builder)
    insights.ts             (smart insights generator)
    analytics.ts            (local analytics tracker)
  assets/logo.png.asset.json (uploaded logo via lovable-assets)
  styles.css                (tokens, theme)
public/{robots.txt,sitemap.xml,manifest.webmanifest}
```

## Build order

1. Tokens, theme, fonts, header/footer, theme toggle, currency context
2. Finance math + unit-safe formatters
3. FD/TD/SD forms + ResultCard with animated counters
4. GrowthChart + PNG export
5. Rate comparison, plan comparison, break-even, smart insights
6. History panel
7. PDF report
8. Adsterra gate + ad slots
9. Hidden admin: gate, analytics, ads, settings, content (homepage/about/contact/privacy/FAQ editable), reports, backups
10. Routes (about, contact, privacy) reading from content store
11. SEO: per-route head, JSON-LD, robots, sitemap
12. Polish: dark mode pass, mobile QA, animations, empty states

After approval I'll start building straight through.
