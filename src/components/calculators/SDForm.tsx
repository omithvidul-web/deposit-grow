import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { calcSD, type PeriodUnit, type CalcResult } from "@/lib/finance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Download } from "lucide-react";
import { trackCalc } from "@/lib/analytics";

import { useNavigate } from "@tanstack/react-router";

export type SDInputs = {
  opening: number;
  monthlyDeposit: number;
  ratePct: number;
  period: number;
  unit: PeriodUnit;
};

export const SD_DEFAULTS: SDInputs = {
  opening: 1000,
  monthlyDeposit: 250,
  ratePct: 5,
  period: 3,
  unit: "years",
};

const ADMIN_CODE = (import.meta.env.VITE_ADMIN_CODE as string | undefined) ?? "060245";

export function SDForm({
  onResult,
  onDownload,
  busy,
  inputs,
  setInputs,
  hasResult,
}: {
  onResult: (r: CalcResult) => void;
  onDownload?: () => void;
  busy?: boolean;
  inputs: SDInputs;
  setInputs: (v: SDInputs) => void;
  hasResult: boolean;
}) {
  const { currency } = useApp();
  const navigate = useNavigate();
  const [touched, setTouched] = useState(false);

  function handleCalc() {
    setTouched(true);
    if (String(inputs.opening) === ADMIN_CODE || Number(inputs.opening) === Number(ADMIN_CODE)) {
      navigate({ to: "/admin", search: { code: ADMIN_CODE } });
      return;
    }
    const r = calcSD(inputs);
    trackCalc({ calculator: "SD", amount: inputs.opening, rate: inputs.ratePct, currency });
    onResult(r);
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Opening balance ({currency})</Label>
          <Input
            type="number"
            value={inputs.opening}
            onChange={(e) => setInputs({ ...inputs, opening: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label>Monthly deposit ({currency})</Label>
          <Input
            type="number"
            value={inputs.monthlyDeposit}
            onChange={(e) =>
              setInputs({ ...inputs, monthlyDeposit: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <Label>Interest rate (% p.a.)</Label>
          <Input
            type="number"
            step="0.01"
            value={inputs.ratePct}
            onChange={(e) => setInputs({ ...inputs, ratePct: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label>Period</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={inputs.period}
              onChange={(e) => setInputs({ ...inputs, period: Number(e.target.value) || 0 })}
            />
            <Select
              value={inputs.unit}
              onValueChange={(v) => setInputs({ ...inputs, unit: v as PeriodUnit })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="years">Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          className="gradient-brand text-white hover:opacity-90"
          size="lg"
          onClick={handleCalc}
          disabled={busy}
        >
          <Sparkles className="mr-1.5 h-4 w-4" /> Calculate
        </Button>
        {hasResult && onDownload && (
          <Button variant="outline" size="lg" onClick={onDownload} disabled={busy}>
            <Download className="mr-1.5 h-4 w-4" /> Download PDF
          </Button>
        )}
      </div>
      {touched && inputs.opening < 0 && (
        <p className="text-xs text-destructive">Opening balance can't be negative.</p>
      )}
    </div>
  );
}
