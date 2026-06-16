import type { MarketContextData } from "@/lib/assetContext";
import type { AssetUnit } from "@/lib/market";

interface AssetMarketContextProps {
  context: MarketContextData;
  unit?: AssetUnit;
}

function fmt(value: number, unit: AssetUnit = "index"): string {
  if (unit === "percent") return `${value.toFixed(2)}%`;
  if (value >= 10000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 100) return value.toFixed(2);
  return value.toFixed(4);
}

export function AssetMarketContext({ context, unit = "index" }: AssetMarketContextProps) {
  const { fiftyTwoWeekLow, fiftyTwoWeekHigh, positionPct, sma200, trendVs200, trendPctDelta } = context;

  const has52W = fiftyTwoWeekLow != null && fiftyTwoWeekHigh != null && positionPct != null;
  const hasSMA = sma200 != null && trendVs200 != null && trendPctDelta != null;

  if (!has52W && !hasSMA) return null;

  return (
    <section className="rounded-card border border-bg-sidebar bg-bg-card p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">Market Context</h2>

      <div className="mt-3 space-y-4">
        {/* 52W Range */}
        {has52W && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[10px] text-text-secondary">
              <span>52W Low — {fmt(fiftyTwoWeekLow!, unit)}</span>
              <span className="font-medium text-text-primary">{positionPct}%</span>
              <span>{fmt(fiftyTwoWeekHigh!, unit)} — 52W High</span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg-sidebar">
              <div
                className="h-full rounded-full bg-accent-purple"
                style={{ width: `${positionPct}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-text-secondary/60">
              Current price is in the{" "}
              <span className="font-medium text-text-primary">
                {positionPct! <= 25 ? "lower quartile" : positionPct! <= 50 ? "lower half" : positionPct! <= 75 ? "upper half" : "upper quartile"}
              </span>{" "}
              of its 52-week range.
            </p>
          </div>
        )}

        {/* 200-day SMA */}
        {hasSMA && (
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-text-secondary">200-Day Average</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-text-primary">{fmt(sma200!, unit)}</p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                  trendVs200 === "above"
                    ? "bg-accent-green/10 text-accent-green"
                    : "bg-error/10 text-error"
                }`}
              >
                {trendVs200 === "above" ? "▲" : "▼"}{" "}
                {trendVs200!.charAt(0).toUpperCase() + trendVs200!.slice(1)} SMA
              </span>
              <p className="mt-0.5 font-mono text-[10px] text-text-secondary">
                {trendPctDelta! >= 0 ? "+" : ""}
                {trendPctDelta!.toFixed(2)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
