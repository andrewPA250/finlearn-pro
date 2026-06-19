"use client";

import Link from "next/link";
import type { TickerQuote } from "@/lib/market/ticker";
import { DEFAULT_RIBBON_SYMBOLS, getRibbonItemPriority } from "@/lib/markets/ribbonAssets";
import styles from "./MarketRibbon.module.css";

interface MarketRibbonProps {
  quotes?: Record<string, TickerQuote | null>;
  loading?: boolean;
}

function formatPrice(quote: TickerQuote): string {
  const price = quote.value;
  if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 1) return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return price.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

/** "+0.70%" / "-2.75%" / "0.00%" — sign omitted only for exact zero. */
function formatChange(pct: number): string {
  if (pct === 0) return "0.00%";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function changeArrow(pct: number): string {
  if (pct > 0) return "▲";
  if (pct < 0) return "▼";
  return "•";
}

interface RibbonItemProps {
  symbol: string;
  quote: TickerQuote | null;
}

function RibbonItem({ symbol, quote }: RibbonItemProps) {
  if (!quote) {
    return (
      <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5">
        <span className="text-[11px] font-semibold text-text-secondary">{symbol}</span>
        <span className="text-[11px] text-text-disabled">—</span>
      </div>
    );
  }

  const change = quote.changePercent;
  const changeColor =
    change > 0 ? "text-positive" : change < 0 ? "text-negative" : "text-text-disabled";

  return (
    <Link href={`/asset/${symbol}`} className="shrink-0">
      <div className="flex items-center gap-1.5 whitespace-nowrap px-2.5 transition-colors duration-150 hover:bg-bg-hover/50">
        <span className="text-[11px] font-semibold text-text-primary">{symbol}</span>
        <span className="font-mono text-[11px] text-text-secondary">{formatPrice(quote)}</span>
        <span className={`font-mono text-[11px] font-semibold ${changeColor}`}>
          {changeArrow(change)} {formatChange(change)}
        </span>
      </div>
    </Link>
  );
}

function RibbonTape({
  symbols,
  quotes,
}: {
  symbols: string[];
  quotes: Record<string, TickerQuote | null> | undefined;
}) {
  // Duplicated once for a seamless infinite loop.
  const duplicatedSymbols = [...symbols, ...symbols];

  return (
    <div className={`relative overflow-hidden ${styles.scrollContainer}`}>
      {/* Edge fades — the tape reads as continuing past the viewport, no hard clipping. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-bg-sidebar to-transparent sm:w-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-bg-sidebar to-transparent sm:w-10" />

      <div
        className={`flex h-full min-w-min items-center ${styles.scrollTrack}`}
        role="marquee"
        aria-label="Market ribbon"
      >
        {duplicatedSymbols.map((symbol, idx) => (
          <RibbonItem key={`${symbol}-${idx}`} symbol={symbol} quote={quotes?.[symbol] ?? null} />
        ))}
      </div>
    </div>
  );
}

export function MarketRibbon({ quotes, loading }: MarketRibbonProps) {
  const sortedSymbols = [...DEFAULT_RIBBON_SYMBOLS].sort(
    (a, b) => getRibbonItemPriority(b) - getRibbonItemPriority(a)
  );

  return (
    <div className="relative border-b border-bg-border/30 bg-bg-sidebar/60 backdrop-blur-sm">
      <RibbonTape symbols={sortedSymbols} quotes={quotes} />
      {loading && <div className="absolute inset-0 animate-pulse bg-bg-sidebar/10" />}
    </div>
  );
}
