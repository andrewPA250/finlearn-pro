"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { MarketsSidebar } from "@/components/markets/MarketsSidebar";
import { MARKET_CATEGORIES } from "@/lib/markets/catalog";

interface HeatmapViewProps {
  instruments: MarketInstrument[];
  quotesBySymbol: Record<string, TickerQuote>;
}

type SortBy = "marketCap" | "change" | "alphabetical";

export function HeatmapView({ instruments, quotesBySymbol }: HeatmapViewProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("marketCap");

  // Compute filtered and sorted data
  const tiles = useMemo(() => {
    const filtered = instruments.filter((instrument) => {
      const quote = quotesBySymbol[instrument.symbol];

      // Must have a valid quote
      if (!quote || quote.value <= 0 || isNaN(quote.value)) return false;

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(instrument.category)) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      const quoteA = quotesBySymbol[a.symbol];
      const quoteB = quotesBySymbol[b.symbol];

      if (!quoteA || !quoteB) return 0;

      switch (sortBy) {
        case "marketCap":
          return (quoteB.stats?.marketCap ?? 0) - (quoteA.stats?.marketCap ?? 0);
        case "change":
          return quoteB.changePercent - quoteA.changePercent;
        case "alphabetical":
          return a.symbol.localeCompare(b.symbol);
        default:
          return 0;
      }
    });

    return filtered;
  }, [instruments, quotesBySymbol, selectedCategories, sortBy]);

  // Compute stats
  const stats = useMemo(() => {
    const gainers = tiles.filter((t) => quotesBySymbol[t.symbol]?.changePercent > 0).length;
    const losers = tiles.filter((t) => quotesBySymbol[t.symbol]?.changePercent < 0).length;
    const avgChange =
      tiles.length > 0
        ? tiles.reduce((sum, t) => sum + (quotesBySymbol[t.symbol]?.changePercent ?? 0), 0) / tiles.length
        : 0;

    return { total: tiles.length, gainers, losers, avgChange };
  }, [tiles, quotesBySymbol]);

  // Calculate max market cap for sizing
  const maxMarketCap = useMemo(() => {
    return Math.max(...tiles.map((t) => quotesBySymbol[t.symbol]?.stats?.marketCap ?? 1));
  }, [tiles, quotesBySymbol]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const getColorClass = (changePercent: number): string => {
    if (changePercent > 5) return "bg-green-600/90";
    if (changePercent > 2) return "bg-green-500/70";
    if (changePercent > 0.5) return "bg-green-500/40";
    if (changePercent > -0.5) return "bg-gray-600/20";
    if (changePercent > -2) return "bg-red-500/40";
    if (changePercent > -5) return "bg-red-500/70";
    return "bg-red-600/90";
  };

  const getTileSize = (marketCap?: number): string => {
    if (!marketCap || maxMarketCap === 0) return "h-20";
    const ratio = marketCap / maxMarketCap;
    if (ratio > 0.5) return "h-32";
    if (ratio > 0.1) return "h-24";
    if (ratio > 0.01) return "h-20";
    return "h-16";
  };

  return (
    <div className="mx-auto max-w-platform px-4 py-6 md:px-6">
      {/* Page header */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-text-primary">Market Heatmap</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Real-time visualization of market performance across asset categories.
        </p>
      </div>

      {/* Layout: sidebar + main */}
      <div className="flex gap-8 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
        {/* Context sidebar — desktop only */}
        <MarketsSidebar />

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Summary bar */}
          <div className="mb-6 grid grid-cols-2 gap-3 rounded-card border border-border-base bg-bg-secondary p-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-text-secondary">Assets</p>
              <p className="text-xl font-bold text-text-primary">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Gainers</p>
              <p className="text-xl font-bold text-green-500">{stats.gainers}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Losers</p>
              <p className="text-xl font-bold text-red-500">{stats.losers}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Avg Change</p>
              <p className={`text-xl font-bold ${stats.avgChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.avgChange.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-6 rounded-card border border-border-base bg-bg-secondary p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Category</p>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {MARKET_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedCategories.includes(cat.id)
                      ? "bg-cyan text-bg-primary"
                      : "bg-bg-primary text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Sort By</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="rounded border border-border-base bg-bg-primary px-2 py-1 text-xs text-text-primary focus:border-cyan focus:outline-none"
              >
                <option value="marketCap">Market Cap</option>
                <option value="change">Daily Change</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Heatmap grid */}
          <div className="rounded-card border border-border-base bg-bg-secondary p-4">
            {tiles.length === 0 ? (
              <div className="py-8 text-center text-text-secondary">
                No assets match your filters.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tiles.map((instrument) => {
                  const quote = quotesBySymbol[instrument.symbol];
                  if (!quote) return null;

                  return (
                    <Link
                      key={instrument.symbol}
                      href={`/asset/${instrument.symbol}`}
                      className={`flex flex-col justify-center gap-1 rounded-lg p-2 transition duration-150 hover:scale-105 hover:shadow-lg ${getTileSize(quote.stats?.marketCap)} ${getColorClass(quote.changePercent)} text-center`}
                      title={`${instrument.name} - ${quote.changePercent.toFixed(2)}%`}
                    >
                      <p className="font-mono text-xs font-bold text-white">
                        {instrument.symbol}
                      </p>
                      <p className={`text-xs font-semibold ${quote.changePercent >= 0 ? "text-green-100" : "text-red-100"}`}>
                        {quote.changePercent >= 0 ? "+" : ""}
                        {quote.changePercent.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-white/70">
                        ${quote.value.toFixed(quote.value > 100 ? 0 : 2)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
