"use client";

import { useState, useRef } from "react";
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

  // Format based on magnitude
  if (price >= 10000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 100) return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return price.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function formatChange(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

interface RibbonItemProps {
  symbol: string;
  quote: TickerQuote | null;
}

function RibbonItem({ symbol, quote }: RibbonItemProps) {
  if (!quote) {
    return (
      <div className="flex shrink-0 items-center gap-2 border-r border-bg-sidebar/40 px-3 py-2 last:border-r-0">
        <div>
          <p className="text-xs font-semibold text-text-secondary">{symbol}</p>
          <p className="text-[10px] text-text-secondary/50">—</p>
        </div>
      </div>
    );
  }

  const isPositive = quote.changePercent >= 0;
  const changeColor = isPositive ? "text-accent-green" : "text-error";

  return (
    <Link href={`/asset/${symbol}`}>
      <div className="flex shrink-0 items-center gap-2 border-r border-bg-sidebar/40 px-3 py-2 transition-colors duration-200 hover:bg-bg-sidebar/30 last:border-r-0">
        <div>
          <p className="text-xs font-semibold text-text-primary">{symbol}</p>
          <p className={`text-[10px] font-mono font-medium ${changeColor}`}>
            {formatChange(quote.changePercent)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono font-medium text-text-primary">{formatPrice(quote)}</p>
          <p className="text-[10px] text-text-secondary/50">{quote.unit === "percent" ? "bp" : ""}</p>
        </div>
      </div>
    </Link>
  );
}

function RibbonScroll({
  symbols,
  quotes,
}: {
  symbols: string[];
  quotes: Record<string, TickerQuote | null> | undefined;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Duplicate symbols for seamless infinite scroll
  const duplicatedSymbols = [...symbols, ...symbols];

  return (
    <div
      ref={scrollerRef}
      className={`overflow-hidden ${styles.scrollContainer}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .${styles.scrollContainer} .${styles.scrollTrack} {
          display: flex;
          animation: scroll-left 60s linear infinite;
          will-change: transform;
        }

        .${styles.scrollContainer}:hover .${styles.scrollTrack},
        .${styles.scrollContainer}.paused .${styles.scrollTrack} {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className={`flex h-12 min-w-min items-center ${styles.scrollTrack} ${isPaused ? "paused" : ""}`}
        role="marquee"
        aria-label="Market ribbon"
      >
        {duplicatedSymbols.map((symbol, idx) => (
          <RibbonItem
            key={`${symbol}-${idx}`}
            symbol={symbol}
            quote={quotes?.[symbol] ?? null}
          />
        ))}
      </div>
    </div>
  );
}

export function MarketRibbon({ quotes, loading }: MarketRibbonProps) {
  const sortedSymbols = [...DEFAULT_RIBBON_SYMBOLS].sort((a, b) => {
    const priorityA = getRibbonItemPriority(a);
    const priorityB = getRibbonItemPriority(b);
    return priorityB - priorityA;
  });

  return (
    <div className="border-b border-bg-card bg-bg-sidebar/40 backdrop-blur-sm">
      {/* Desktop ribbon with auto-scroll and pause on hover */}
      <div className="hidden md:block">
        <RibbonScroll symbols={sortedSymbols} quotes={quotes} />
      </div>

      {/* Mobile ribbon — continuous scroll, no pause */}
      <div className="md:hidden">
        <div className={`overflow-hidden ${styles.scrollContainer}`}>
          <style>{`
            .mobile-scroll-${styles.scrollTrack} {
              display: flex;
              animation: scroll-left 60s linear infinite;
              will-change: transform;
            }
          `}</style>

          <div
            className={`flex h-12 min-w-min items-center ${styles.scrollTrack}`}
            role="marquee"
            aria-label="Market ribbon"
          >
            {/* Duplicate for seamless loop on mobile */}
            {[...sortedSymbols, ...sortedSymbols].map((symbol, idx) => (
              <RibbonItem
                key={`${symbol}-${idx}`}
                symbol={symbol}
                quote={quotes?.[symbol] ?? null}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 bg-bg-sidebar/10 animate-pulse" />
      )}
    </div>
  );
}
