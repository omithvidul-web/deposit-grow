import { getAds } from "@/lib/site";

/**
 * Adsterra gate. Returns a wrapped action that — when ads are enabled, the
 * direct link is configured — opens the direct link in a new tab first, then
 * immediately runs the original action so the user never re-enters data. When
 * ads aren't enabled, runs the action directly.
 */
export function withAdGate(action: () => void | Promise<void>) {
  return () => {
    const ads = getAds();
    if (!ads.enabled || !ads.directLink) {
      void action();
      return;
    }
    // Run the action first (within the user gesture) so the download/print
    // isn't cancelled when the browser switches to the ad tab, especially on
    // mobile. Then open the direct link.
    const openAd = () => {
      try {
        window.open(ads.directLink, "_blank", "noopener,noreferrer");
      } catch {
        /* ignore popup block */
      }
    };
    try {
      const result = action();
      if (result && typeof (result as Promise<void>).then === "function") {
        (result as Promise<void>).finally(openAd);
      } else {
        openAd();
      }
    } catch {
      openAd();
    }
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
