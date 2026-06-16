import type { MarketContextData } from "@/lib/assetContext";
import type { AssetUnit } from "@/lib/market";

interface AssetMarketContextProps {
  context: MarketContextData;
  unit?: AssetUnit;
}

function fmt(value: number, unit: AssetUnit = "index"): string {
  if (unit === "percent") return `${value.toFixed(2)}%`;
  if (value >= 10000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 100)   return value.toFixed(2);
  return value.toFixed(4);
}

export function AssetMarketContext({ context, unit = "index" }: AssetMarketContextProps) {
  const { sma200, trendVs200, trendPctDelta } = context;
  const hasSMA = sma200 != null && trendVs200 != null && trendPctDelta != null;

  if (!hasSMA) return null;

  return (
    <section className="rounded-card border border-bg-border bg-bg-card p-5">
      <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        Trend vs 200-Day Average
      </h2>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mb-0.5 text-xs text-text-muted">200-Day SMA</p>
          <p className="font-mono text-xl font-bold text-text-primary">{fmt(sma200!, unit)}</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block rounded px-3 py-1 text-xs font-bold ${
              trendVs200 === "above"
                ? "bg-positive/10 text-positive"
                : "bg-negative/10 text-negative"
            }`}
          >
            {trendVs200 === "above" ? "▲ Above" : "▼ Below"} SMA
          </span>
          <p className="mt-1 font-mono text-xs text-text-muted">
            {trendPctDelta! >= 0 ? "+" : ""}
            {trendPctDelta!.toFixed(2)}% from SMA
          </p>
        </div>
      </div>
    </section>
  );
}
