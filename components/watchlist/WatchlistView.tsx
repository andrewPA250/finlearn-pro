"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { useWatchlist } from "@/lib/watchlist/WatchlistContext";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";
import { AssetLogo } from "@/components/ui/AssetLogo";
import { useCurrency } from "@/lib/currency/CurrencyContext";

interface WatchlistViewProps {
  quotesBySymbol: Record<string, TickerQuote>;
  instrumentsBySymbol: Record<string, MarketInstrument>;
}

type SortField = "symbol" | "price" | "change";
type SortOrder = "asc" | "desc";

export function WatchlistView({ quotesBySymbol, instrumentsBySymbol }: WatchlistViewProps) {
  const { symbols: watchedSymbols, removeFromWatchlist } = useWatchlist();
  const { language } = useSettings();
  const { formatMoneyCompact } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Compute filtered and sorted results
  const results = useMemo(() => {
    // Get valid assets from watchlist
    let filtered = watchedSymbols
      .filter((symbol) => {
        const quote = quotesBySymbol[symbol];
        const instrument = instrumentsBySymbol[symbol];
        // Only show if we have both quote and instrument data
        return quote && instrument && quote.value > 0;
      })
      .map((symbol) => ({
        symbol,
        quote: quotesBySymbol[symbol]!,
        instrument: instrumentsBySymbol[symbol]!,
      }));

    // Search filter
    const searchLower = searchTerm.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.symbol.toLowerCase().includes(searchLower) ||
          item.instrument.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let compareVal: number = 0;

      switch (sortField) {
        case "symbol":
          compareVal = a.symbol.localeCompare(b.symbol);
          break;
        case "price":
          compareVal = a.quote.value - b.quote.value;
          break;
        case "change":
          compareVal = a.quote.changePercent - b.quote.changePercent;
          break;
      }

      return sortOrder === "asc" ? compareVal : -compareVal;
    });

    return filtered;
  }, [watchedSymbols, quotesBySymbol, instrumentsBySymbol, searchTerm, sortField, sortOrder]);

  // Compute stats
  const stats = useMemo(() => {
    const gainers = results.filter((item) => item.quote.changePercent > 0).length;
    const losers = results.filter((item) => item.quote.changePercent < 0).length;
    return { total: results.length, gainers, losers };
  }, [results]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  if (results.length === 0 && watchedSymbols.length === 0) {
    return (
      <div className="mx-auto max-w-platform px-4 py-12 md:px-6">
        <div className="flex flex-col items-center justify-center rounded-card border border-bg-border bg-bg-card px-6 py-16 text-center">
          <div className="mb-4 text-5xl">📋</div>
          <h1 className="mb-2 text-2xl font-bold text-text-primary">
            {t("emptyWatchlist", language)}
          </h1>
          <p className="mb-6 max-w-sm text-text-secondary">
            {t("emptyWatchlistDesc", language)}
          </p>
          <Link
            href="/markets"
            className="rounded-card bg-cyan px-4 py-2 text-sm font-semibold text-bg-primary hover:bg-cyan/90 transition"
          >
            {t("exploreMarkets", language)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-platform px-4 py-6 md:px-6">
      {/* Page header */}
      <div className="mb-4 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-text-primary">{t("myWatchlist", language)}</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          {t("trackFavorites", language)}
        </p>
      </div>

      {/* Summary bar */}
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-card border border-bg-border bg-bg-card p-3.5 md:grid-cols-3 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
        <div>
          <p className="text-xs text-text-secondary">{t("total", language)} {t("assets", language)}</p>
          <p className="text-xl font-bold text-text-primary">{stats.total}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">{t("gainers", language)}</p>
          <p className="text-xl font-bold text-positive">{stats.gainers}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">{t("losers", language)}</p>
          <p className="text-xl font-bold text-negative">{stats.losers}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 rounded-card border border-bg-border bg-bg-card p-3.5 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              {t("search", language)}
            </label>
            <input
              type="text"
              placeholder="Symbol or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-bg-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-cyan focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              {t("sortBy", language)}
            </label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="rounded border border-bg-border bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-cyan focus:outline-none"
            >
              <option value="symbol">Symbol</option>
              <option value="price">{t("price", language)}</option>
              <option value="change">{t("dailyChange", language)}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results table */}
      <div className="rounded-card border border-bg-border bg-bg-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        {results.length === 0 ? (
          <div className="px-4 py-8 text-center text-text-secondary">
            {t("noAssetsSearch", language)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-bg-border bg-bg-primary z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                    <SortButton
                      label="Symbol"
                      isActive={sortField === "symbol"}
                      sortOrder={sortOrder}
                      onClick={() => handleSort("symbol")}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                    {t("name", language)}
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary">
                    <SortButton
                      label={t("price", language)}
                      isActive={sortField === "price"}
                      sortOrder={sortOrder}
                      onClick={() => handleSort("price")}
                    />
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary">
                    <SortButton
                      label={t("dailyChange", language)}
                      isActive={sortField === "change"}
                      sortOrder={sortOrder}
                      onClick={() => handleSort("change")}
                    />
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-text-secondary">
                    {t("category", language)}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-text-secondary">
                    {t("remove", language)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {results.map((item) => (
                  <tr key={item.symbol} className="hover:bg-bg-hover transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AssetLogo
                          symbol={item.instrument.finnhubSymbol ?? item.symbol}
                          name={item.instrument.name}
                          category={item.instrument.category}
                          size="sm"
                        />
                        <Link
                          href={`/asset/${item.symbol}`}
                          className="font-mono font-semibold text-cyan hover:underline"
                        >
                          {item.symbol}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      <Link
                        href={`/asset/${item.symbol}`}
                        className="hover:text-text-primary hover:underline"
                      >
                        {item.instrument.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatMoneyCompact(item.quote.value)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono ${
                        item.quote.changePercent >= 0 ? "text-positive" : "text-negative"
                      }`}
                    >
                      {item.quote.changePercent >= 0 ? "+" : ""}
                      {item.quote.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded bg-bg-primary px-2 py-1 text-xs text-text-muted">
                        {item.instrument.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeFromWatchlist(item.symbol)}
                        className="text-xs text-negative hover:underline transition"
                        title="Remove from watchlist"
                      >
                        {t("remove", language)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface SortButtonProps {
  label: string;
  isActive: boolean;
  sortOrder: SortOrder;
  onClick: () => void;
}

function SortButton({
  label,
  isActive,
  sortOrder,
  onClick,
}: SortButtonProps) {
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
