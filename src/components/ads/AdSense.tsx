import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import type { AdSenseLocation, AdSenseUnit } from "@/lib/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const loadedClients = new Set<string>();

function loadAdSenseScript(clientId: string) {
  if (typeof window === "undefined" || !clientId) return;
  if (loadedClients.has(clientId)) return;
  loadedClients.add(clientId);
  const existing = document.querySelector(
    `script[data-adsense-client="${clientId}"]`,
  );
  if (existing) return;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
    clientId,
  )}`;
  s.setAttribute("data-adsense-client", clientId);
  document.head.appendChild(s);
}

function AdSenseUnitRender({ unit }: { unit: AdSenseUnit }) {
  const ref = useRef<HTMLModElement | null>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!unit.clientId || !unit.slotId) return;
    loadAdSenseScript(unit.clientId);
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore */
    }
  }, [unit.clientId, unit.slotId]);

  if (!unit.clientId || !unit.slotId) return null;

  const common: React.CSSProperties = { display: "block" };
  const baseProps: Record<string, string> = {
    "data-ad-client": unit.clientId,
    "data-ad-slot": unit.slotId,
  };

  if (unit.format === "responsive") {
    return (
      <ins
        ref={ref}
        className="adsbygoogle"
        style={common}
        {...baseProps}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  }
  if (unit.format === "in-article") {
    return (
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        {...baseProps}
      />
    );
  }
  if (unit.format === "in-feed") {
    return (
      <ins
        ref={ref}
        className="adsbygoogle"
        style={common}
        data-ad-format="fluid"
        data-ad-layout-key={unit.layoutKey || "-6t+ed+2i-1n-4w"}
        {...baseProps}
      />
    );
  }
  // display banner
  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: "inline-block", width: "100%", minHeight: 90 }}
      {...baseProps}
    />
  );
}

export function AdSenseSlot({ location }: { location: AdSenseLocation }) {
  const { adsense } = useApp();
  if (!adsense.enabled) return null;
  const units = adsense.units.filter(
    (u) => u.enabled && u.location === location,
  );
  if (units.length === 0) return null;
  return (
    <div className="my-4 flex flex-col gap-3">
      {units.map((u) => (
        <AdSenseUnitRender key={u.id} unit={u} />
      ))}
    </div>
  );
}
