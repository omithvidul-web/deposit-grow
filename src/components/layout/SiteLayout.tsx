import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppProvider } from "@/contexts/AppContext";
import { trackVisit } from "@/lib/analytics";
import { AdSenseSlot } from "@/components/ads/AdSense";

export function SiteLayout() {
  useEffect(() => {
    trackVisit();
  }, []);
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <AdSenseSlot location="header" />
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <AdSenseSlot location="footer" />
        </div>
        <Footer />
      </div>
    </AppProvider>
  );
}
