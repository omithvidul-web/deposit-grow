import { lsGet, lsSet } from "./storage";

export type SiteSettings = {
  siteName: string;
  contactEmail: string;
  seoTitle: string;
  seoDescription: string;
};

export type AdsterraSettings = {
  enabled: boolean;
  directLink: string;
  cooldownSeconds: number;
  bannerHtml: string;
  nativeHtml: string;
  popunderHtml: string;
};

export type ContentStore = {
  hero: { title: string; subtitle: string };
  about: string;
  contact: string;
  privacy: string;
  faqs: Array<{ q: string; a: string }>;
  footer: string;
  tips: string[];
};

const SK = "dc.site.v1";
const AK = "dc.ads.v1";
const CK = "dc.content.v1";

export const defaultSite: SiteSettings = {
  siteName: "Deposit Calculator",
  contactEmail: "hello@depositcalculator.app",
  seoTitle: "Deposit Calculator — Fixed, Term & Savings Deposit Calculator",
  seoDescription:
    "Free FD, TD and SD calculator. Calculate maturity, interest, growth and compare plans — instantly, no signup required.",
};

export const defaultAds: AdsterraSettings = {
  enabled: false,
  directLink: "",
  cooldownSeconds: 60,
  bannerHtml: "",
  nativeHtml: "",
  popunderHtml: "",
};

export const defaultContent: ContentStore = {
  hero: {
    title: "Calculate. Compare. Grow.",
    subtitle:
      "Premium fixed deposit, term deposit and savings calculators. Instant, accurate, no signup.",
  },
  about:
    "Deposit Calculator is a free, browser-based financial tool built to help you make better deposit decisions. We don't collect your data, don't require signup, and don't charge anything. Everything runs locally in your browser so your numbers stay yours.",
  contact:
    "Have feedback, found a bug, or want a feature? We'd love to hear from you. Drop us a line at the address below.",
  privacy:
    "We don't collect personal information. Calculations and history are stored locally in your browser using localStorage. If you clear your browser data, everything is removed. Optional advertising redirects may be configured by the site operator and are subject to the advertiser's privacy practices.",
  faqs: [
    {
      q: "Is Deposit Calculator free to use?",
      a: "Yes. All calculators are free with no signup or account required.",
    },
    {
      q: "What's the difference between FD, TD and SD?",
      a: "Fixed Deposits (FD) lock a lump sum at a fixed rate for a set period. Term Deposits (TD) are similar but typically compound monthly. Savings Deposits (SD) allow ongoing monthly contributions on top of an opening balance.",
    },
    {
      q: "Which interest method should I pick?",
      a: "Compound interest typically yields more for longer periods. Simple interest is sometimes used by banks for short-term FDs. Always check your bank's terms.",
    },
    {
      q: "Are my numbers stored anywhere?",
      a: "No. All data lives in your own browser's local storage. We never send it to a server.",
    },
    {
      q: "How accurate are the calculations?",
      a: "We use the standard mathematical formulas banks use. Actual returns may differ slightly due to compounding schedules, fees, or tax withholding.",
    },
  ],
  footer: "© Deposit Calculator. Built for clarity. Numbers stay in your browser.",
  tips: [
    "Compound interest favours longer time horizons — even small extra years compound meaningfully.",
    "Compare effective yield rather than nominal rate when comparing across compounding frequencies.",
    "Splitting a large deposit across staggered maturities (laddering) improves liquidity without giving up much yield.",
    "Reinvesting monthly interest can lift effective yield by 0.1–0.3% versus payout schedules.",
  ],
};

export function getSite(): SiteSettings {
  return { ...defaultSite, ...lsGet(SK, defaultSite) };
}
export function setSite(s: SiteSettings) {
  lsSet(SK, s);
}

export function getAds(): AdsterraSettings {
  return { ...defaultAds, ...lsGet(AK, defaultAds) };
}
export function setAds(s: AdsterraSettings) {
  lsSet(AK, s);
}

export function getContent(): ContentStore {
  const stored = lsGet(CK, defaultContent);
  return { ...defaultContent, ...stored };
}
export function setContent(c: ContentStore) {
  lsSet(CK, c);
}
