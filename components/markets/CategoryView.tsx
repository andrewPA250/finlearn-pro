"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { getCategoryLabel, getCategoryDescription } from "@/lib/markets/categoryHelpers";
import type { MarketCategoryId } from "@/types/markets";
import { MarketListRow } from "@/components/markets/MarketListRow";
import { MarketsTopMovers } from "@/components/markets/MarketsTopMovers";

type SortOption = "name" | "symbol" | "price" | "change" | "changePercent";

interface CategoryViewProps {
  categoryId: MarketCategoryId;
  instruments: MarketInstrument[];
  quotesBySymbol: Record<string, TickerQuote>;
}

export function CategoryView({ categoryId, instruments, quotesBySymbol }: CategoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("symbol");
  const [sortAsc, setSortAsc] = useState(true);

  // Filter by search query
  const filtered = useMemo(
    () =>
      instruments.filter((inst) => {
        const q = searchQuery.toLowerCase();
        return (
          inst.symbol.toLowerCase().includes(q) ||
          inst.name.toLowerCase().includes(q)
        );
      }),
    [instruments, searchQuery]
  );

  // Sort
  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const quoteA = quotesBySymbol[a.symbol];
      const quoteB = quotesBySymbol[b.symbol];
      let cmp = 0;

      switch (sortBy) {
        case "symbol":
          cmp = a.symbol.localeCompare(b.symbol);
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "price":
          cmp = (quoteA?.value ?? 0) - (quoteB?.value ?? 0);
          break;
        case "change":
          cmp = (quoteA?.change ?? 0) - (quoteB?.change ?? 0);
          break;
        case "changePercent":
          cmp = (quoteA?.changePercent ?? 0) - (quoteB?.changePercent ?? 0);
          break;
      }

      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [filtered, quotesBySymbol, sortBy, sortAsc]);

  const categoryLabel = getCategoryLabel(categoryId);
  const categoryDesc = getCategoryDescription(categoryId);

  // Get quotes for top movers
  const categoryQuotes = sorted.map((inst) => quotesBySymbol[inst.symbol]).filter(Boolean);

  return (
    <div className="mx-auto max-w-platform px-4 py-6 md:px-6">
      {/* Breadcrumb + Header */}
      <div className="mb-6 animate-fade-in-up">
        <Link href="/markets" className="text-xs font-medium text-text-muted hover:text-text-secondary transition">
          ← Markets
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">{categoryLabel}</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {instruments.length} {instruments.length === 1 ? "asset" : "assets"}
        </p>
        {categoryDesc && <p className="mt-1 text-sm text-text-muted">{categoryDesc}</p>}
      </div>

      {/* Top Movers */}
      {categoryQuotes.length > 0 && (
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
          <MarketsTopMovers quotes={categoryQuotes} />
        </div>
      )}

      {/* Search + Sort Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        {/* Search input */}
        <input
          type="text"
          placeholder="Search by symbol or name…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-card border border-bg-border/25 bg-bg-card/40 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan/40"
        />

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sortBy" className="text-xs font-medium text-text-secondary">
            Sort by:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-card border border-bg-border/25 bg-bg-card/40 px-2.5 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:border-cyan/40"
          >
            <option value="symbol">Symbol</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="change">Change $</option>
            <option value="changePercent">Change %</option>
          </select>

          {/* Sort direction toggle */}
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="rounded-card border border-bg-border/25 bg-bg-card/40 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition"
            title={sortAsc ? "Ascending" : "Descending"}
          >
            {sortAsc ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Assets list */}
      <section className="rounded-card border border-bg-border/15 bg-bg-card/60 divide-y divide-bg-border/10 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-text-muted">No assets found matching your search.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 rounded-card px-3 py-1.5 text-xs font-semibold text-cyan hover:text-cyan-light transition"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          sorted.map((instrument) => (
            <MarketListRow
              key={instrument.symbol}
              instrument={instrument}
              quote={quotesBySymbol[instrument.symbol]}
            />
          ))
        )}
      </section>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-text-disabled">
        Showing {sorted.length} of {instruments.length} assets · Last update: live
      </p>
    </div>
  );
}
