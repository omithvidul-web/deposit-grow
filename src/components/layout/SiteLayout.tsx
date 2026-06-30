import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppProvider } from "@/contexts/AppContext";
import { trackVisit } from "@/lib/analytics";

export function SiteLayout() {
  useEffect(() => {
    trackVisit();
  }, []);
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
}
