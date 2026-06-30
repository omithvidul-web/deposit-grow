import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { calcFD, type FDMethod, type PeriodUnit, type CalcResult } from "@/lib/finance";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Download } from "lucide-react";
import { trackCalc } from "@/lib/analytics";
import { pushHistory } from "@/lib/history";
import { useNavigate } from "@tanstack/react-router";

export type FDInputs = {
  principal: number;
  ratePct: number;
  period: number;
  unit: PeriodUnit;
  method: FDMethod;
};

export const FD_DEFAULTS: FDInputs = {
  principal: 10000,
  ratePct: 6.5,
  period: 5,
  unit: "years",
  method: "compound",
};

const ADMIN_CODE = (import.meta.env.VITE_ADMIN_CODE as string | undefined) ?? "060245";

export function CalculatorForm({
  variant,
  onResult,
  onDownload,
  busy,
  inputs,
  setInputs,
  hasResult,
}: {
  variant: "FD" | "TD" | "SD";
  onResult: (r: CalcResult, gateThroughAd: boolean) => void;
  onDownload?: () => void;
  busy?: boolean;
  inputs: FDInputs & { opening?: number; monthlyDeposit?: number };
  setInputs: (v: FDInputs & { opening?: number; monthlyDeposit?: number }) => void;
  hasResult: boolean;
}) {
  const { currency } = useApp();
  const navigate = useNavigate();
  const [touched, setTouched] = useState(false);

  function handleCalc() {
    setTouched(true);
    // Hidden admin gate
    if (String(inputs.principal) === ADMIN_CODE) {
      navigate({ to: "/admin", search: { code: ADMIN_CODE } });
      return;
    }
    if (variant === "FD") {
      const r = calcFD({
        principal: inputs.principal,
        ratePct: inputs.ratePct,
        period: inputs.period,
        unit: inputs.unit,
        method: inputs.method,
      });
      trackCalc({ calculator: "FD", amount: inputs.principal, rate: inputs.ratePct, currency });
      pushHistory({ calculator: "FD", currency, inputs, result: r });
      onResult(r, true);
    } else if (variant === "TD") {
      // TD = compound monthly fixed
      const r = calcFD({
        principal: inputs.principal,
        ratePct: inputs.ratePct,
        period: inputs.period,
        unit: inputs.unit,
        method: "compound",
      });
      trackCalc({ calculator: "TD", amount: inputs.principal, rate: inputs.ratePct, currency });
      pushHistory({ calculator: "TD", currency, inputs, result: r });
      onResult(r, true);
    } else {
      // SD handled in dedicated wrapper
      onResult({} as CalcResult, false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="amount">
            {variant === "SD" ? "Opening balance" : "Deposit amount"} ({currency})
          </Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            value={inputs.principal}
            onChange={(e) =>
              setInputs({ ...inputs, principal: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <Label htmlFor="rate">Interest rate (% p.a.)</Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            value={inputs.ratePct}
            onChange={(e) => setInputs({ ...inputs, ratePct: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="period">Period</Label>
          <Input
            id="period"
            type="number"
            value={inputs.period}
            onChange={(e) => setInputs({ ...inputs, period: Number(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Select
            value={inputs.unit}
            onValueChange={(v) => setInputs({ ...inputs, unit: v as PeriodUnit })}
          >
            <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="months">Months</SelectItem>
              <SelectItem value="years">Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {variant === "FD" && (
        <div>
          <Label className="mb-1.5 block">Interest method</Label>
          <Tabs
            value={inputs.method}
            onValueChange={(v) => setInputs({ ...inputs, method: v as FDMethod })}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple">Simple</TabsTrigger>
              <TabsTrigger value="compound">Compound</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

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

      {touched && inputs.principal <= 0 && (
        <p className="text-xs text-destructive">Enter a deposit amount greater than zero.</p>
      )}
    </div>
  );
}
