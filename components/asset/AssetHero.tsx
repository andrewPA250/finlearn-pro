import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { DataFreshness } from "@/lib/providers/types";
import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteValue, formatQuoteChangeDetail } from "@/lib/market/ticker";
import { AssetStatusBadge } from "@/components/asset/AssetStatusBadge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { LocalTime } from "@/components/ui/LocalTime";

interface AssetHeroProps {
  instrument: MarketInstrument;
  categoryLabel: string;
  quote: TickerQuote | null;
}

const FRESHNESS_TOOLTIPS: Record<string, string> = {
  live:            "Data updated in near real-time via streaming.",
  "near-live":     "Data updated frequently (crypto/forex 24/7). May have a small delay vs the real market.",
  delayed:         "Near-realtime data via Yahoo Finance during regular market hours. Updated every ~60 seconds.",
  "market-closed": "Market is currently closed. Price reflects the last available quote from the prior session.",
  eod:             "Last available end-of-day data.",
  unavailable:     "Current provider returned no data for this instrument.",
};

function getSourceLabel(source: string): string {
  switch (source) {
    case "yahoo":            return "Yahoo Finance";
    case "finnhub":          return "Finnhub";
    case "coingecko":        return "CoinGecko";
    case "frankfurter-ecb":  return "ECB / Frankfurter";
    case "local-static":     return "FRED / Stooq";
    default:                 return source;
  }
}

function getTimestampLabel(freshness: DataFreshness): string {
  return freshness === "market-closed" ? "Last Trade" : "Updated";
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(dateStr: string): string {
  const [year, monthStr, dayStr] = dateStr.split("-");
  const month = MONTHS[parseInt(monthStr, 10) - 1] ?? monthStr;
  return `${parseInt(dayStr, 10)} ${month} ${year}`;
}

export function AssetHero({ instrument, categoryLabel, quote }: AssetHeroProps) {
  const freshness = quote?.freshness;
  const tooltipText = freshness ? (FRESHNESS_TOOLTIPS[freshness] ?? "") : "";
  const isPositive = quote ? quote.change >= 0 : true;

  return (
    <div className="animate-fade-in-up border-b border-bg-border py-5">
      {/* Breadcrumb */}
      <Link
        href="/markets"
        className="text-xs font-medium text-text-muted transition duration-150 hover:text-text-primary"
      >
        ← Markets
      </Link>

      {/* Hero: 2-col on desktop */}
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {/* Left: symbol + name + meta */}
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded border border-bg-border bg-bg-card px-2 py-0.5 font-mono text-xs font-bold text-text-primary">
              {instrument.symbol}
            </span>
            <span className="rounded bg-cyan-bg/50 px-2 py-0.5 text-xs font-semibold text-cyan">
              {categoryLabel}
            </span>
            <span className="flex items-center gap-0.5">
              <AssetStatusBadge
                status={instrument.status}
                freshness={freshness as DataFreshness | undefined}
              />
              {tooltipText && (
                <InfoTooltip text={tooltipText} label={`Data quality: ${freshness}`} />
              )}
            </span>
          </div>

          <h1 className="text-2xl font-bold leading-tight text-text-primary">
            {instrument.name}
          </h1>

          {quote && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted">
              <span>{getSourceLabel(quote.source)}</span>
              <span>·</span>
              <span>
                {getTimestampLabel(freshness!)}
                {" "}
                {quote.timestamp ? (
                  <LocalTime
                    timestamp={quote.timestamp}
                    format={freshness === "market-closed" ? "datetime" : "time"}
                  />
                ) : (
                  formatDate(quote.date)
                )}
              </span>
            </div>
          )}
        </div>

        {/* Right: price block */}
        {quote ? (
          <div className="shrink-0 md:text-right">
            <p className="font-mono text-4xl font-bold leading-none tracking-tight text-text-primary">
              {formatQuoteValue(quote)}
            </p>
            <p className={`mt-2 font-mono text-base font-bold ${isPositive ? "text-positive" : "text-negative"}`}>
              {formatQuoteChangeDetail(quote)}
            </p>
          </div>
        ) : (
          <p className="max-w-reading text-sm text-text-secondary">
            {instrument.status === "soon"
              ? `Data and chart for ${instrument.symbol} coming with the full asset catalog.`
              : `Data temporarily unavailable for ${instrument.symbol}.`}
          </p>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {instrument.assetId && (
          <Link
            href="/workbench"
            className="inline-flex items-center gap-1.5 rounded-card border border-bg-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition duration-150 hover:border-cyan/30 hover:text-cyan"
          >
            Open in Quant Lab →
          </Link>
        )}
        <button
          disabled
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-card border border-bg-border px-3 py-1.5 text-xs font-semibold text-text-disabled opacity-40"
        >
          Compare
        </button>
        <button
          disabled
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-card border border-bg-border px-3 py-1.5 text-xs font-semibold text-text-disabled opacity-40"
        >
          ★ Watch
        </button>
      </div>
    </div>
  );
}
