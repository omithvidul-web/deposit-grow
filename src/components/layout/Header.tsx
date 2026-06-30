import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
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

export function Header() {
  const { currency, setCurrency, theme, toggleTheme, site } = useApp();
  return (
    <header className="sticky top-0 z-40 w-full glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={logoAsset.url}
            alt={`${site.siteName} logo`}
            className="h-9 w-9 rounded-full shadow-sm transition-transform group-hover:scale-105"
          />
          <div className="leading-tight">
            <div className="font-display text-base font-semibold tracking-tight">
              {site.siteName}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Calculate · Compare · Grow
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/" as const, label: "Home" },
            { to: "/about" as const, label: "About" },
            { to: "/contact" as const, label: "Contact" },
            { to: "/privacy" as const, label: "Privacy" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm font-medium bg-accent text-foreground" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
            <SelectTrigger className="h-9 w-[88px]">
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
