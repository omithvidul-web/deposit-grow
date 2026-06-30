import { lsGet, lsSet } from "@/lib/storage";
import { getAds } from "@/lib/site";

const COOLDOWN_KEY = "dc.ads.lastShown";

/**
 * Adsterra gate. Returns a wrapped action that — when ads are enabled, the
 * direct link is configured, and the cooldown has elapsed — opens the direct
 * link in a new tab, then immediately runs the original action so the user
 * never re-enters data. When ads aren't enabled, runs the action directly.
 */
export function withAdGate(action: () => void) {
  return () => {
    const ads = getAds();
    if (!ads.enabled || !ads.directLink) {
      action();
      return;
    }
    const last = lsGet<number>(COOLDOWN_KEY, 0);
    const now = Date.now();
    if (now - last < ads.cooldownSeconds * 1000) {
      action();
      return;
    }
    lsSet(COOLDOWN_KEY, now);
    try {
      window.open(ads.directLink, "_blank", "noopener,noreferrer");
    } catch {
      /* ignore popup block */
    }
    // Resume immediately on the current tab so the user doesn't lose state.
    action();
  };
}

export function AdSlot({ kind }: { kind: "banner" | "native" | "popunder" }) {
  const ads = getAds();
  if (!ads.enabled) return null;
  const html =
    kind === "banner"
      ? ads.bannerHtml
      : kind === "native"
        ? ads.nativeHtml
        : ads.popunderHtml;
  if (!html) return null;
  return (
    <div
      className="my-4 rounded-xl border border-dashed border-border p-2 text-center text-xs text-muted-foreground"
      // Operator-provided ad script
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
