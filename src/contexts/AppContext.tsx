import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { lsGet, lsSet } from "@/lib/storage";
import type { CurrencyCode } from "@/lib/currency";
import { getSite, getAds, getContent, getAdSense, type SiteSettings, type AdsterraSettings, type ContentStore, type AdSenseSettings } from "@/lib/site";

type Theme = "light" | "dark";

type Ctx = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  site: SiteSettings;
  refreshSite: () => void;
  ads: AdsterraSettings;
  refreshAds: () => void;
  content: ContentStore;
  refreshContent: () => void;
  adsense: AdSenseSettings;
  refreshAdSense: () => void;

};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [theme, setThemeState] = useState<Theme>("light");
  const [site, setSiteS] = useState<SiteSettings>(getSite());
  const [ads, setAdsS] = useState<AdsterraSettings>(getAds());
  const [content, setContentS] = useState<ContentStore>(getContent());
  const [adsense, setAdSenseS] = useState<AdSenseSettings>(getAdSense());

  // hydrate from storage on mount
  useEffect(() => {
    const c = lsGet<CurrencyCode>("dc.currency", "USD");
    setCurrencyState(c);
    const stored = lsGet<Theme | null>("dc.theme", null);
    const prefers =
      stored ??
      (typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setThemeState(prefers);
    setSiteS(getSite());
    setAdsS(getAds());
    setContentS(getContent());
    setAdSenseS(getAdSense());
  }, []);

  // apply theme class
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    lsSet("dc.currency", c);
  };
  const setTheme = (t: Theme) => {
    setThemeState(t);
    lsSet("dc.theme", t);
  };
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const value: Ctx = {
    currency,
    setCurrency,
    theme,
    setTheme,
    toggleTheme,
    site,
    refreshSite: () => setSiteS(getSite()),
    ads,
    refreshAds: () => setAdsS(getAds()),
    content,
    refreshContent: () => setContentS(getContent()),
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
