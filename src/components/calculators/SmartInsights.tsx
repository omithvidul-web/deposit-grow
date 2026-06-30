import { Lightbulb } from "lucide-react";

export function SmartInsights({ insights }: { insights: string[] }) {
  if (!insights.length) return null;
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-2 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-warning" />
        <div className="font-display text-sm font-semibold">Smart insights</div>
      </div>
      <ul className="space-y-2 text-sm">
        {insights.map((i, idx) => (
          <li key={idx} className="flex gap-2">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full gradient-brand" />
            <span className="text-muted-foreground">{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
