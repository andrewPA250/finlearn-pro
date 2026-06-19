import type { ProviderStats } from "@/lib/providers/types";
import type { AssetUnit } from "@/lib/market";

interface AssetStatsSectionProps {
  stats: ProviderStats;
  unit?: AssetUnit;
  currentPrice?: number;
}

function fmtPrice(value: number, unit: AssetUnit = "index"): string {
  if (unit === "percent") return `${value.toFixed(2)}%`;
  if (value >= 10000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 100)   return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value >= 1)     return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return value.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

function fmtRange(low: number, high: number, unit: AssetUnit = "index"): string {
  return `${fmtPrice(low, unit)} – ${fmtPrice(high, unit)}`;
}

function fmtVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`;
  if (vol >= 1_000_000)     return `${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000)         return `${(vol / 1_000).toFixed(0)}K`;
  return vol.toLocaleString("en-US");
}

function fmtCompact(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${(n / 1e3).toFixed(1)}K`;
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-bg-hover/40 px-3 py-2.5">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">{label}</p>
      <p className="font-mono text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}

export function AssetStatsSection({ stats, unit = "index", currentPrice }: AssetStatsSectionProps) {
  const cells: { label: string; value: string }[] = [];

  if (stats.previousClose != null) cells.push({ label: "Prev. Close",   value: fmtPrice(stats.previousClose, unit) });
  if (stats.open          != null) cells.push({ label: "Open",           value: fmtPrice(stats.open, unit) });
  if (stats.dayLow != null && stats.dayHigh != null)
    cells.push({ label: "Day Range", value: fmtRange(stats.dayLow, stats.dayHigh, unit) });
  if (stats.volume   != null && stats.volume   > 0) cells.push({ label: "Volume",       value: fmtVolume(stats.volume) });
  if (stats.avgVolume != null && stats.avgVolume > 0) cells.push({ label: "Avg. Vol (3M)", value: fmtVolume(stats.avgVolume) });
  if (stats.marketCap != null) cells.push({ label: "Market Cap",   value: fmtCompact(stats.marketCap) });
  if (stats.pe        != null) cells.push({ label: "P/E Ratio",    value: `${stats.pe.toFixed(2)}x` });
  if (stats.eps       != null) cells.push({ label: "EPS (TTM)",    value: `$${stats.eps.toFixed(2)}` });

  if (cells.length === 0) return null;

  // Compute 52W position from current price + stats
  const low52  = stats.fiftyTwoWeekLow;
  const high52 = stats.fiftyTwoWeekHigh;
  const has52W = low52 != null && high52 != null;

  let positionPct: number | null = null;
  if (currentPrice != null && low52 != null && high52 != null && high52 > low52) {
    positionPct = Math.round(((currentPrice - low52) / (high52 - low52)) * 100);
    positionPct = Math.min(100, Math.max(0, positionPct));
  }

  return (
    <section id="stats" className="rounded-card border border-bg-border/15 bg-bg-card/60 p-5">
      <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        Market Statistics
      </h2>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {cells.map((cell) => (
          <StatCell key={cell.label} label={cell.label} value={cell.value} />
        ))}
      </div>

      {/* 52W Range bar */}
      {has52W && (
        <div className="mt-4 pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            52-Week Range
          </p>
          <div className="flex items-center gap-3">
            <span className="shrink-0 font-mono text-[11px] text-text-muted">
              {fmtPrice(low52!, unit)}
            </span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-bg-border/30">
              <div
                className="absolute h-full rounded-full bg-cyan transition-all"
                style={{ width: positionPct != null ? `${positionPct}%` : "50%" }}
              />
            </div>
            <span className="shrink-0 font-mono text-[11px] text-text-muted">
              {fmtPrice(high52!, unit)}
            </span>
          </div>
          {positionPct != null && (
            <p className="mt-1.5 text-[10px] text-text-muted/60">
              At {positionPct}% of 52-week range ·{" "}
              {positionPct <= 25 ? "lower quartile" : positionPct <= 50 ? "lower half" : positionPct <= 75 ? "upper half" : "upper quartile"}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
