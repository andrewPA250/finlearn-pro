import type { TooltipContentProps } from "recharts";
import type { ChartPoint, SeriesMeta } from "@/lib/market";

/**
 * Crea il componente tooltip per Recharts: data, valore e variazione per
 * ogni serie visibile (sez. 4 spec — `ChartTooltip`). Per le serie "index"
 * (normalizzate base 100) la variazione è relativa (%), per le serie
 * "percent" (US Treasury 10Y, deviazione standard) è la differenza in punti
 * percentuali — i due numeri non sono confrontabili tra loro, quindi vanno
 * etichettati in modo diverso.
 */
export function createChartTooltip(series: SeriesMeta[], points: ChartPoint[]) {
  return function ChartTooltip({ active, label }: TooltipContentProps) {
    if (!active || typeof label !== "string") return null;

    const index = points.findIndex((point) => point.date === label);
    const current = points[index];
    const previous = index > 0 ? points[index - 1] : undefined;
    if (!current) return null;

    return (
      <div className="max-w-[240px] rounded-card border border-accent-purple/30 bg-bg-card p-3 font-mono text-xs text-text-primary shadow-lg">
        <div className="mb-2 text-text-secondary">{label}</div>
        <div className="flex flex-col gap-1">
          {series.map((item) => {
            const value = current[item.key];
            if (value === undefined) return null;

            const previousValue = previous?.[item.key];
            let change: string | null = null;
            if (previousValue !== undefined) {
              if (item.unit === "index") {
                if (previousValue !== 0) {
                  const pct = ((value - previousValue) / previousValue) * 100;
                  change = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
                }
              } else {
                const diff = value - previousValue;
                change = `${diff >= 0 ? "+" : ""}${diff.toFixed(2)} p.p.`;
              }
            }

            const formattedValue = `${value.toFixed(2)}${item.unit === "percent" ? "%" : ""}`;

            return (
              <div key={item.key} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="break-words" style={{ color: item.color }}>
                  {item.label}
                </span>
                <span className="whitespace-nowrap">
                  {formattedValue}
                  {change ? ` (${change})` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
}
