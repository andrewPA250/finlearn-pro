"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWatchlist } from "@/lib/watchlist/WatchlistContext";
import { getInstrumentBySymbol } from "@/lib/markets/catalog";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteValue, formatQuoteChange } from "@/lib/market/ticker";

interface WatchedAsset {
  instrument: MarketInstrument;
  quote: TickerQuote | null;
}

export function WatchlistWidget() {
  const { symbols } = useWatchlist();
  const [assets, setAssets] = useState<WatchedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Fetch quotes for all watched assets from API
  useEffect(() => {
    setHydrated(true);
    if (symbols.length === 0) {
      setIsLoading(false);
      return;
    }

    async function fetchWatchedAssets() {
      try {
        const resolved = symbols
          .map((sym) => getInstrumentBySymbol(sym))
          .filter((inst): inst is MarketInstrument => inst != null);

        // Fetch all quotes in one request
        const query = new URLSearchParams({
          symbols: resolved.map((i) => i.symbol).join(","),
        });

        const response = await fetch(`/api/quotes?${query}`);
        if (!response.ok) {
          setAssets(
            resolved.map((inst) => ({ instrument: inst, quote: null }))
          );
          setIsLoading(false);
          return;
        }

        const quoteMap: Record<string, TickerQuote> = await response.json();
        const fetched = resolved.map((inst) => ({
          instrument: inst,
          quote: quoteMap[inst.symbol] ?? null,
        }));

        setAssets(fetched);
      } catch {
        setAssets(
          symbols
            .map((sym) => getInstrumentBySymbol(sym))
            .filter((inst): inst is MarketInstrument => inst != null)
            .map((inst) => ({ instrument: inst, quote: null }))
        );
      }
      setIsLoading(false);
    }

    fetchWatchedAssets();
  }, [symbols]);

  if (!hydrated) {
    // During SSR, show placeholder
    return (
      <section className="rounded-card border border-bg-border bg-bg-card p-5 flex flex-col">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-4">
          Watchlist
        </h2>
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <div className="h-9 w-9 rounded-full bg-bg-sidebar flex items-center justify-center mb-3">
            <span className="text-lg">★</span>
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">Loading…</p>
        </div>
      </section>
    );
  }

  // Empty state
  if (symbols.length === 0) {
    return (
      <section className="rounded-card border border-bg-border bg-bg-card p-5 flex flex-col">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-4">
          Watchlist
        </h2>
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <div className="h-9 w-9 rounded-full bg-bg-sidebar flex items-center justify-center mb-3">
            <span className="text-lg">★</span>
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">Your watchlist is empty</p>
          <p className="text-xs text-text-muted mb-4">Add assets from the Markets page</p>
          <Link
            href="/markets"
            className="rounded px-3 py-1 text-[10px] font-bold bg-cyan text-bg-primary hover:bg-cyan-light transition"
          >
            Explore Markets →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-bg-border bg-bg-card p-5 flex flex-col">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
        Watchlist ({symbols.length})
      </h2>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <p className="text-xs text-text-muted">Loading…</p>
        </div>
      ) : (
        <div className="space-y-1 min-h-0">
          {assets.map((asset) => {
            const quote = asset.quote;
            const isPos = quote ? quote.changePercent >= 0 : true;
            return (
              <Link
                key={asset.instrument.symbol}
                href={`/asset/${asset.instrument.symbol}`}
                className="flex items-center justify-between gap-2 rounded-card px-2 py-1.5 transition hover:bg-bg-hover"
              >
                <div className="min-w-0">
                  <span className="font-mono text-xs font-bold text-text-primary block">
                    {asset.instrument.symbol}
                  </span>
                  <span className="text-[10px] text-text-muted truncate">
                    {asset.instrument.name}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-xs font-bold text-text-primary">
                    {quote ? formatQuoteValue(quote) : "—"}
                  </div>
                  <div
                    className={`font-mono text-[10px] font-bold ${
                      isPos ? "text-positive" : "text-negative"
                    }`}
                  >
                    {quote ? formatQuoteChange(quote) : "—"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
