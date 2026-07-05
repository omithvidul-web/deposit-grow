import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun, X, Home, Info, Mail, Shield, FileText } from "lucide-react";
import { useState } from "react";
import { logoDataUrl as logoUrl } from "@/assets/logo-data";
import { useApp } from "@/contexts/AppContext";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { to: "/" as const, label: "Home", icon: Home },
  { to: "/about" as const, label: "About", icon: Info },
  { to: "/contact" as const, label: "Contact", icon: Mail },
  { to: "/privacy" as const, label: "Privacy Policy", icon: Shield },
  { to: "/terms" as const, label: "Terms of Service", icon: FileText },
];

export function Header() {
  const { currency, setCurrency, theme, toggleTheme, site } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass">
      <div className="mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-3 sm:px-6 max-w-7xl">
        {/* Left: Hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="relative h-10 w-10 rounded-full transition-all duration-200 hover:scale-110 hover:bg-accent active:scale-95 hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[85%] max-w-sm border-r border-white/10 bg-background/80 backdrop-blur-2xl p-0"
          >
            <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-border/50">
              <img
                src={logoUrl}
                alt={`${site.siteName} logo`}
                className="h-10 w-10 rounded-full shadow-sm"
              />
              <div className="leading-tight">
                <div className="font-display text-base font-semibold">{site.siteName}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Calculate · Compare · Grow
                </div>
              </div>
            </div>
            <nav className="flex flex-col gap-1 px-3 py-4">
              {NAV_ITEMS.map((item, i) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: true }}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 transition-all duration-200 hover:bg-accent hover:text-foreground hover:translate-x-1 animate-fade-in"
                  activeProps={{
                    className:
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold bg-accent text-foreground",
                  }}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto px-6 py-5 border-t border-border/50 text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} {site.siteName}
            </div>
          </SheetContent>
        </Sheet>

        {/* Center: Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 group min-w-0">
          <img
            src={logoUrl}
            alt={`${site.siteName} logo`}
            className="h-8 w-8 shrink-0 rounded-full shadow-sm transition-transform group-hover:scale-105"
          />
          <div className="leading-tight text-center block min-w-0">
            <div className="font-display text-sm sm:text-base font-semibold tracking-tight truncate">
{site.siteName}
            </div>
            <div className="hidden sm:block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Calculate · Compare · Grow
            </div>
          </div>
        </Link>

        {/* Right: Currency + Theme */}
        <div className="flex items-center gap-1.5 justify-end">
          <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
            <SelectTrigger className="h-9 w-auto min-w-[90px] sm:min-w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
