"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { MarketsSidebar } from "@/components/markets/MarketsSidebar";
import { MARKET_CATEGORIES } from "@/lib/markets/catalog";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";

interface ScreenerViewProps {
  instruments: MarketInstrument[];
  quotesBySymbol: Record<string, TickerQuote>;
}

type SortField = "symbol" | "name" | "price" | "change" | "marketCap" | "pe" | "volume";
type SortOrder = "asc" | "desc";

export function ScreenerView({ instruments, quotesBySymbol }: ScreenerViewProps) {
  const { language, currency } = useSettings();
  const lang = language;
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [changeFilter, setChangeFilter] = useState<"all" | "positive" | "negative">("all");
  const [marketCapMin, setMarketCapMin] = useState("");
  const [marketCapMax, setMarketCapMax] = useState("");
  const [peMin, setPeMin] = useState("");
  const [peMax, setPeMax] = useState("");
  const [dividendYieldMin, setDividendYieldMin] = useState("");
  const [dividendYieldMax, setDividendYieldMax] = useState("");

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Compute filtered and sorted results
  const results = useMemo(() => {
    const priceRangeMin = priceMin ? Number(priceMin) : 0;
    const priceRangeMax = priceMax ? Number(priceMax) : Infinity;
    const mcapMin = marketCapMin ? Number(marketCapMin) * 1e9 : 0;
    const mcapMax = marketCapMax ? Number(marketCapMax) * 1e9 : Infinity;
    const peMinVal = peMin ? Number(peMin) : 0;
    const peMaxVal = peMax ? Number(peMax) : Infinity;
    const dyMin = dividendYieldMin ? Number(dividendYieldMin) : 0;
    const dyMax = dividendYieldMax ? Number(dividendYieldMax) : Infinity;

    // Deduplicate by symbol — keep first occurrence
    const seen = new Set<string>();
    const deduped = instruments.filter((i) => {
      if (seen.has(i.symbol)) return false;
      seen.add(i.symbol);
      return true;
    });

    const filtered = deduped.filter((instrument) => {
      const quote = quotesBySymbol[instrument.symbol];

      // Must have valid quote with positive price
      if (!quote || quote.value <= 0 || isNaN(quote.value)) return false;

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

      // Price range filter
      if (quote.value < priceRangeMin || quote.value > priceRangeMax) {
        return false;
      }

      // Change filter
      if (changeFilter !== "all") {
        if (changeFilter === "positive" && quote.changePercent <= 0) return false;
        if (changeFilter === "negative" && quote.changePercent >= 0) return false;
      }

      // Market cap range filter
      if (quote.stats?.marketCap) {
        const mcap = quote.stats.marketCap;
        if (mcap < mcapMin || mcap > mcapMax) return false;
      } else if (marketCapMin || marketCapMax) {
        return false; // Exclude if market cap filter is set but data missing
      }

      // P/E range filter
      if (quote.stats?.pe) {
        const pe = quote.stats.pe;
        if (pe < peMinVal || pe > peMaxVal) return false;
      } else if (peMin || peMax) {
        return false; // Exclude if P/E filter is set but data missing
      }

      // Dividend yield range filter
      if (quote.stats?.dividendYield) {
        const dy = quote.stats.dividendYield;
        if (dy < dyMin || dy > dyMax) return false;
      } else if (dividendYieldMin || dividendYieldMax) {
        return false; // Exclude if dividend yield filter is set but data missing
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
    priceMin,
    priceMax,
    changeFilter,
    marketCapMin,
    marketCapMax,
    peMin,
    peMax,
    dividendYieldMin,
    dividendYieldMax,
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
    setPriceMin("");
    setPriceMax("");
    setChangeFilter("all");
    setMarketCapMin("");
    setMarketCapMax("");
    setPeMin("");
    setPeMax("");
    setDividendYieldMin("");
    setDividendYieldMax("");
  }

  const CAT_KEY: Record<string, Parameters<typeof t>[0]> = {
    equity: "stocks",
    etf: "etf",
    index: "indices",
    crypto: "crypto",
    forex: "forex",
    commodity: "commodities",
    bond: "bonds",
  };

  const getCategoryLabel = (cat: string): string =>
    CAT_KEY[cat] ? t(CAT_KEY[cat], lang) : cat;

  return (
    <div className="mx-auto max-w-platform px-4 py-6 md:px-6">
      {/* Page header */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-text-primary">{t("marketScreener", lang)}</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          {lang === "it"
            ? `Scopri e filtra ${instruments.length}+ asset globali per categoria, prezzo, performance e fondamentali.`
            : `Discover and filter ${instruments.length}+ global assets by category, price, performance, and fundamentals.`}
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
              <h2 className="font-semibold text-text-primary">{t("filters", lang)}</h2>
              <button
                onClick={resetFilters}
                className="text-xs text-cyan hover:underline"
              >
                {t("resetAll", lang)}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  {t("search", lang)}
                </label>
                <input
                  type="text"
                  placeholder="Symbol or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary placeholder-text-muted focus:border-cyan focus:outline-none"
                />
              </div>

              {/* Price Min */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Price Min
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              {/* Price Max */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Price Max
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              {/* Change Filter */}
              <div className="sm:col-span-2 lg:col-span-1">
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

              {/* Market Cap Min */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Market Cap Min (B)
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={marketCapMin}
                  onChange={(e) => setMarketCapMin(e.target.value)}
                  className="w-full rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              {/* Market Cap Max */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Market Cap Max (B)
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={marketCapMax}
                  onChange={(e) => setMarketCapMax(e.target.value)}
                  className="w-full rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              {/* P/E Min */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  P/E Min
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={peMin}
                  onChange={(e) => setPeMin(e.target.value)}
                  className="w-full rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              {/* P/E Max */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  P/E Max
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={peMax}
                  onChange={(e) => setPeMax(e.target.value)}
                  className="w-full rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              {/* Dividend Yield Min */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Div Yield Min (%)
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={dividendYieldMin}
                  onChange={(e) => setDividendYieldMin(e.target.value)}
                  className="w-full rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              {/* Dividend Yield Max */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Div Yield Max (%)
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={dividendYieldMax}
                  onChange={(e) => setDividendYieldMax(e.target.value)}
                  className="w-full rounded border border-border-base bg-bg-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>
            </div>

            {/* Category filter */}
            <div className="mt-4 pt-4 border-t border-border-base">
              <p className="mb-2 text-xs font-medium text-text-secondary">{t("categories", lang)}</p>
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
                    {getCategoryLabel(cat.id)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="rounded-card border border-border-base bg-bg-secondary overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-base px-4 py-3">
              <p className="text-sm text-text-secondary">
                <span className="font-semibold text-text-primary">{results.length}</span> {t("results", lang)}
              </p>
            </div>

            {/* Results table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 border-b border-border-base bg-bg-primary z-10">
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
                        className="border-t border-border-base hover:bg-bg-hover cursor-pointer transition"
                      >
                        <td className="px-3 py-3">
                          <Link
                            href={`/asset/${instrument.symbol}`}
                            className="font-mono text-sm font-semibold text-cyan hover:underline"
                          >
                            {instrument.symbol}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-text-secondary">
                          <Link
                            href={`/asset/${instrument.symbol}`}
                            className="text-sm hover:text-text-primary hover:underline"
                          >
                            {instrument.name}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="rounded bg-bg-primary px-2 py-1 text-xs text-text-muted">
                            {getCategoryLabel(instrument.category)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-mono tabular-nums">
                          {currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$"}{quote.value.toFixed(quote.value > 100 ? 0 : 2)}
                        </td>
                        <td
                          className={`px-3 py-3 text-right font-mono tabular-nums ${
                            quote.changePercent >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {quote.changePercent >= 0 ? "+" : ""}
                          {quote.changePercent.toFixed(2)}%
                        </td>
                        <td className="px-3 py-3 text-right text-text-secondary font-mono tabular-nums hidden lg:table-cell">
                          {quote.stats?.marketCap
                            ? `$${(quote.stats.marketCap / 1e9).toFixed(1)}B`
                            : "—"}
                        </td>
                        <td className="px-3 py-3 text-right text-text-secondary font-mono tabular-nums hidden lg:table-cell">
                          {quote.stats?.pe ? quote.stats.pe.toFixed(1) : "—"}
                        </td>
                        <td className="px-3 py-3 text-right text-text-secondary font-mono tabular-nums hidden md:table-cell">
                          {quote.stats?.dividendYield
                            ? quote.stats.dividendYield.toFixed(2) + "%"
                            : "—"}
                        </td>
                        <td className="px-3 py-3 text-right text-text-secondary font-mono tabular-nums hidden xl:table-cell">
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
                {t("noResultsFilter", lang)}
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
