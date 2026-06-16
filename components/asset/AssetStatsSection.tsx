import type { ProviderStats } from "@/lib/providers/types";
import type { AssetUnit } from "@/lib/market";

interface AssetStatsSectionProps {
  stats: ProviderStats;
  unit?: AssetUnit;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmt(value: number, unit: AssetUnit = "index", decimals = 2): string {
  if (unit === "percent") {
    return `${value.toFixed(decimals)}%`;
  }
  return value.toLocaleString("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtRange(low: number, high: number, unit: AssetUnit = "index"): string {
  return `${fmt(low, unit)} – ${fmt(high, unit)}`;
}

function fmtVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`;
  if (vol >= 1_000_000)     return `${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000)         return `${(vol / 1_000).toFixed(0)}K`;
  return vol.toLocaleString("it-IT");
}

function fmtMarketCap(cap: number): string {
  if (cap >= 1_000_000_000_000) return `$${(cap / 1_000_000_000_000).toFixed(2)}T`;
  if (cap >= 1_000_000_000)     return `$${(cap / 1_000_000_000).toFixed(2)}B`;
  if (cap >= 1_000_000)         return `$${(cap / 1_000_000).toFixed(2)}M`;
  return `$${cap.toLocaleString("it-IT")}`;
}

// ---------------------------------------------------------------------------
// Stat row sub-component
// ---------------------------------------------------------------------------

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="font-mono text-xs font-medium text-text-primary tabular-nums">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AssetStatsSection({ stats, unit = "index" }: AssetStatsSectionProps) {
  const rows: { label: string; value: string | null }[] = [
    {
      label: "Prev. Close",
      value: stats.previousClose != null ? fmt(stats.previousClose, unit) : null,
    },
    {
      label: "Open",
      value: stats.open != null ? fmt(stats.open, unit) : null,
    },
    {
      label: "Day Range",
      value:
        stats.dayLow != null && stats.dayHigh != null
          ? fmtRange(stats.dayLow, stats.dayHigh, unit)
          : null,
    },
    {
      label: "52W Range",
      value:
        stats.fiftyTwoWeekLow != null && stats.fiftyTwoWeekHigh != null
          ? fmtRange(stats.fiftyTwoWeekLow, stats.fiftyTwoWeekHigh, unit)
          : null,
    },
    {
      label: "Volume",
      value: stats.volume != null && stats.volume > 0 ? fmtVolume(stats.volume) : null,
    },
    {
      label: "Avg. Volume",
      value: stats.avgVolume != null && stats.avgVolume > 0 ? fmtVolume(stats.avgVolume) : null,
    },
    {
      label: "Market Cap",
      value: stats.marketCap != null ? fmtMarketCap(stats.marketCap) : null,
    },
    {
      label: "P/E Ratio",
      value: stats.pe != null ? stats.pe.toFixed(2) : null,
    },
    {
      label: "EPS (TTM)",
      value: stats.eps != null ? fmt(stats.eps, unit) : null,
    },
    {
      label: "Dividend Yield",
      value: stats.dividendYield != null ? `${stats.dividendYield.toFixed(2)}%` : null,
    },
  ];

  const visibleRows = rows.filter((r) => r.value !== null);
  if (visibleRows.length === 0) return null;

  return (
    <div className="rounded-card border border-bg-card bg-bg-card/50 p-4">
      <h2 className="mb-1 text-sm font-bold text-text-primary">Stats</h2>
      <div className="divide-y divide-bg-card">
        {visibleRows.map((r) => (
          <StatRow key={r.label} label={r.label} value={r.value!} />
        ))}
      </div>
    </div>
  );
}
