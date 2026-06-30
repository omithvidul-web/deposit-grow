import { useEffect, useState } from "react";
import { getHistory, removeHistory, clearHistory, type HistoryEntry } from "@/lib/history";
import { formatMoney } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, History } from "lucide-react";

export function HistoryPanel({
  onReload,
}: {
  onReload?: (e: HistoryEntry) => void;
}) {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  function refresh() {
    setItems(getHistory());
  }

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <div className="font-display text-sm font-semibold">Recent calculations</div>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearHistory();
              refresh();
            }}
          >
            Clear all
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No calculations yet. Your last 20 will appear here.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="rounded-md gradient-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {it.calculator}
                  </span>
                  <span className="truncate font-medium">
                    {formatMoney(it.result.principal, it.currency as CurrencyCode)} →{" "}
                    {formatMoney(it.result.finalValue, it.currency as CurrencyCode)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(it.ts).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-1">
                {onReload && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onReload(it)}
                    aria-label="Reload"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    removeHistory(it.id);
                    refresh();
                  }}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
