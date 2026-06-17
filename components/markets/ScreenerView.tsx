"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { MarketsSidebar } from "@/components/markets/MarketsSidebar";
import { MARKET_CATEGORIES } from "@/lib/markets/catalog";

interface ScreenerViewProps {
  instruments: MarketInstrument[];
  quotesBySymbol: Record<string, TickerQuote>;
}

type SortField = "symbol" | "name" | "price" | "change" | "marketCap" | "pe" | "volume";
type SortOrder = "asc" | "desc";

export function ScreenerView({ instruments, quotesBySymbol }: ScreenerViewProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [changeFilter, setChangeFilter] = useState<"all" | "positive" | "negative">("all");
  const [marketCapRange, setMarketCapRange] = useState<[number, number] | null>(null);
  const [peRange, setPeRange] = useState<[number, number] | null>(null);
  const [dividendYieldRange, setDividendYieldRange] = useState<[number, number] | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Compute filtered and sorted results
  const results = useMemo(() => {
    const filtered = instruments.filter((instrument) => {
      const quote = quotesBySymbol[instrument.symbol];

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(instrument.category)) {
        return false;
      }

      // Search filter
      const searchLower = searchTerm.toLowerCase();
      if (
        searchTerm &&
        !instrument.symbol.toLowerCase().includes(searchLower) &&
        !instrument.name.toLowerCase().includes(searchLower)
      ) {
        return false;
      }

      if (!quote) return false;

      // Price range filter
      if (quote.value < priceRange[0] || quote.value > priceRange[1]) {
        return false;
      }

      // Change filter
      if (changeFilter !== "all") {
        if (changeFilter === "positive" && quote.changePercent <= 0) return false;
        if (changeFilter === "negative" && quote.changePercent >= 0) return false;
      }

      // Market cap range filter
      if (marketCapRange && quote.stats?.marketCap) {
        const mcap = quote.stats.marketCap;
        if (mcap < marketCapRange[0] || mcap > marketCapRange[1]) return false;
      }

      // P/E range filter
      if (peRange && quote.stats?.pe) {
        const pe = quote.stats.pe;
        if (pe < peRange[0] || pe > peRange[1]) return false;
      }

      // Dividend yield range filter
      if (dividendYieldRange && quote.stats?.dividendYield) {
        const dy = quote.stats.dividendYield;
        if (dy < dividendYieldRange[0] || dy > dividendYieldRange[1]) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      const quoteA = quotesBySymbol[a.symbol];
      const quoteB = quotesBySymbol[b.symbol];

      if (!quoteA || !quoteB) return 0;

      let compareVal: number = 0;

      switch (sortField) {
        case "symbol":
          compareVal = a.symbol.localeCompare(b.symbol);
          break;
        case "name":
          compareVal = a.name.localeCompare(b.name);
          break;
        case "price":
          compareVal = quoteA.value - quoteB.value;
          break;
        case "change":
          compareVal = quoteA.changePercent - quoteB.changePercent;
          break;
        case "marketCap":
          compareVal = (quoteA.stats?.marketCap ?? 0) - (quoteB.stats?.marketCap ?? 0);
          break;
        case "pe":
          compareVal = (quoteA.stats?.pe ?? 0) - (quoteB.stats?.pe ?? 0);
          break;
        case "volume":
          compareVal = (quoteA.stats?.volume ?? 0) - (quoteB.stats?.volume ?? 0);
          break;
      }

      return sortOrder === "asc" ? compareVal : -compareVal;
    });

    return filtered;
  }, [
    instruments,
    quotesBySymbol,
    searchTerm,
    selectedCategories,
    priceRange,
    changeFilter,
    marketCapRange,
    peRange,
    dividendYieldRange,
    sortField,
    sortOrder,
  ]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  function resetFilters() {
    setSearchTerm("");
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setChangeFilter("all");
    setMarketCapRange(null);
    setPeRange(null);
    setDividendYieldRange(null);
  }

  const getCategoryLabel = (cat: string) => {
    const category = MARKET_CATEGORIES.find((c) => c.id === cat);
    return category?.label || cat;
  };

  return (
    <div className="mx-auto max-w-platform px-4 py-6 md:px-6">
      {/* Page header */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-text-primary">Market Screener</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Discover and filter 313+ global assets by category, price, performance, and fundamentals.
        </p>
      </div>

      {/* Layout: sidebar + main */}
      <div className="flex gap-8 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
        {/* Context sidebar — desktop only */}
        <MarketsSidebar />

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Filters panel */}
          <div className="mb-6 rounded-card border border-border-base bg-bg-secondary p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-xs text-cyan hover:underline"
              >
                Reset All
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Symbol or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary placeholder-text-muted focus:border-cyan focus:outline-none"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Price
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="flex-1 rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="flex-1 rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                  />
                </div>
              </div>

              {/* Change Filter */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Daily Change
                </label>
                <select
                  value={changeFilter}
                  onChange={(e) => setChangeFilter(e.target.value as typeof changeFilter)}
                  className="w-full rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="positive">↑ Gainers</option>
                  <option value="negative">↓ Losers</option>
                </select>
              </div>

              {/* Market Cap Range */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Market Cap (Billions)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={marketCapRange?.[0] ?? ""}
                    onChange={(e) =>
                      setMarketCapRange([Number(e.target.value) * 1e9, marketCapRange?.[1] ?? 10e12])
                    }
                    className="flex-1 rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={marketCapRange?.[1] ? marketCapRange[1] / 1e9 : ""}
                    onChange={(e) =>
                      setMarketCapRange([marketCapRange?.[0] ?? 0, Number(e.target.value) * 1e9])
                    }
                    className="flex-1 rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                  />
                </div>
              </div>

              {/* P/E Range */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  P/E Ratio
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={peRange?.[0] ?? ""}
                    onChange={(e) =>
                      setPeRange([Number(e.target.value), peRange?.[1] ?? 100])
                    }
                    className="flex-1 rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={peRange?.[1] ?? ""}
                    onChange={(e) =>
                      setPeRange([peRange?.[0] ?? 0, Number(e.target.value)])
                    }
                    className="flex-1 rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                  />
                </div>
              </div>

              {/* Dividend Yield Range */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Dividend Yield (%)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={dividendYieldRange?.[0] ?? ""}
                    onChange={(e) =>
                      setDividendYieldRange([Number(e.target.value), dividendYieldRange?.[1] ?? 10])
                    }
                    className="flex-1 rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={dividendYieldRange?.[1] ?? ""}
                    onChange={(e) =>
                      setDividendYieldRange([dividendYieldRange?.[0] ?? 0, Number(e.target.value)])
                    }
                    className="flex-1 rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Category filter */}
            <div className="mt-4 pt-4 border-t border-border-base">
              <p className="mb-2 text-xs font-medium text-text-secondary">Categories</p>
              <div className="flex flex-wrap gap-2">
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
            </div>
          </div>

          {/* Results */}
          <div className="rounded-card border border-border-base bg-bg-secondary overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-base px-4 py-3">
              <p className="text-sm text-text-secondary">
                <span className="font-semibold text-text-primary">{results.length}</span> results
              </p>
            </div>

            {/* Results table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border-base bg-bg-primary">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-text-secondary">
                      <SortButton
                        label="Symbol"
                        isActive={sortField === "symbol"}
                        sortOrder={sortOrder}
                        onClick={() => handleSort("symbol")}
                      />
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-text-secondary">
                      <SortButton
                        label="Name"
                        isActive={sortField === "name"}
                        sortOrder={sortOrder}
                        onClick={() => handleSort("name")}
                      />
                    </th>
                    <th className="px-4 py-2.5 text-center font-semibold text-text-secondary">
                      Category
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold text-text-secondary">
                      <SortButton
                        label="Price"
                        isActive={sortField === "price"}
                        sortOrder={sortOrder}
                        onClick={() => handleSort("price")}
                      />
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold text-text-secondary">
                      <SortButton
                        label="Change %"
                        isActive={sortField === "change"}
                        sortOrder={sortOrder}
                        onClick={() => handleSort("change")}
                      />
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold text-text-secondary hidden lg:table-cell">
                      <SortButton
                        label="Market Cap"
                        isActive={sortField === "marketCap"}
                        sortOrder={sortOrder}
                        onClick={() => handleSort("marketCap")}
                      />
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold text-text-secondary hidden lg:table-cell">
                      <SortButton
                        label="P/E"
                        isActive={sortField === "pe"}
                        sortOrder={sortOrder}
                        onClick={() => handleSort("pe")}
                      />
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold text-text-secondary hidden md:table-cell">
                      Div. Yield
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold text-text-secondary hidden xl:table-cell">
                      <SortButton
                        label="Volume"
                        isActive={sortField === "volume"}
                        sortOrder={sortOrder}
                        onClick={() => handleSort("volume")}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {results.map((instrument) => {
                    const quote = quotesBySymbol[instrument.symbol];
                    if (!quote) return null;

                    return (
                      <tr
                        key={instrument.symbol}
                        className="hover:bg-bg-hover cursor-pointer transition"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/asset/${instrument.symbol}`}
                            className="font-mono font-semibold text-cyan hover:underline"
                          >
                            {instrument.symbol}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          <Link
                            href={`/asset/${instrument.symbol}`}
                            className="hover:text-text-primary hover:underline"
                          >
                            {instrument.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center text-xs">
                          <span className="rounded bg-bg-primary px-2 py-1 text-text-muted">
                            {getCategoryLabel(instrument.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          ${quote.value.toFixed(2)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono ${
                            quote.changePercent >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {quote.changePercent >= 0 ? "+" : ""}
                          {quote.changePercent.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right text-text-secondary hidden lg:table-cell">
                          {quote.stats?.marketCap
                            ? `$${(quote.stats.marketCap / 1e9).toFixed(1)}B`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-text-secondary hidden lg:table-cell">
                          {quote.stats?.pe ? quote.stats.pe.toFixed(1) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-text-secondary hidden md:table-cell">
                          {quote.stats?.dividendYield
                            ? quote.stats.dividendYield.toFixed(2) + "%"
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-text-secondary hidden xl:table-cell">
                          {quote.stats?.volume
                            ? `${(quote.stats.volume / 1e6).toFixed(1)}M`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {results.length === 0 && (
              <div className="px-4 py-8 text-center text-text-secondary">
                No assets match your filters. Try adjusting your criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SortButton({
  label,
  isActive,
  sortOrder,
  onClick,
}: {
  label: string;
  isActive: boolean;
  sortOrder: SortOrder;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 transition ${
        isActive ? "text-cyan" : "text-text-secondary hover:text-text-primary"
      }`}
    >
      {label}
      {isActive && (
        <span className="text-xs">
          {sortOrder === "asc" ? "↑" : "↓"}
        </span>
      )}
    </button>
  );
}
