import { Link } from "@tanstack/react-router";
import { useApp } from "@/contexts/AppContext";
import logoAsset from "@/assets/logo.png.asset.json";

export function Footer() {
  const { content, site } = useApp();
  return (
    <footer className="mt-24 border-t border-border bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={logoAsset.url} alt="" className="h-8 w-8 rounded-full" />
              <div className="font-display text-base font-semibold">{site.siteName}</div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Free, private fixed deposit, term deposit and savings calculators. Calculate. Compare. Grow.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
              Pages
            </div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-foreground text-muted-foreground">Home</Link></li>
              <li><Link to="/about" className="hover:text-foreground text-muted-foreground">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground text-muted-foreground">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground text-muted-foreground">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
              Calculators
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Fixed Deposit (FD)</li>
              <li>Term Deposit (TD)</li>
              <li>Savings Deposit (SD)</li>
              <li>Comparison & Break-even</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          {content.footer}
        </div>
      </div>
    </footer>
  );
}
