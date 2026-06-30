import { lsGet, lsSet } from "./storage";
import type { CalcResult } from "./finance";

export type HistoryEntry = {
  id: string;
  ts: number;
  calculator: "FD" | "TD" | "SD";
  currency: string;
  inputs: Record<string, unknown>;
  result: CalcResult;
};

const K = "dc.history.v1";

export function getHistory(): HistoryEntry[] {
  return lsGet<HistoryEntry[]>(K, []);
}

export function pushHistory(entry: Omit<HistoryEntry, "id" | "ts">) {
  const all = getHistory();
  const next: HistoryEntry = {
    ...entry,
    id: Math.random().toString(36).slice(2),
    ts: Date.now(),
  };
  const trimmed = [next, ...all].slice(0, 20);
  lsSet(K, trimmed);
  return next;
}

export function removeHistory(id: string) {
  lsSet(K, getHistory().filter((h) => h.id !== id));
}

export function clearHistory() {
  lsSet(K, []);
}
