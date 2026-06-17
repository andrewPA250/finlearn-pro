"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { MarketsSidebar } from "@/components/markets/MarketsSidebar";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeatmapViewProps {
  instruments: MarketInstrument[];
  quotesBySymbol: Record<string, TickerQuote>;
}

type SortBy = "marketCap" | "change" | "alphabetical";

// Display order and labels for category sections
const CATEGORY_ORDER = ["equity", "crypto", "etf", "index", "commodity", "forex", "bond"] as const;

const CATEGORY_DISPLAY: Record<string, { en: string; it: string }> = {
  equity:    { en: "Stocks",       it: "Azioni" },
  etf:       { en: "ETFs",         it: "ETF" },
  index:     { en: "Indices",      it: "Indici" },
  crypto:    { en: "Crypto",       it: "Crypto" },
  commodity: { en: "Commodities",  it: "Materie Prime" },
  forex:     { en: "Forex",        it: "Forex" },
  bond:      { en: "Bonds",        it: "Obbligazioni" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Color class based on daily change percentage (dark-friendly, professional palette) */
function getTileColorClass(changePercent: number): string {
  if (changePercent > 3)  return "bg-green-900 border-green-700/40";
  if (changePercent > 1)  return "bg-green-800/80 border-green-600/30";
  if (changePercent > 0)  return "bg-green-700/50 border-green-600/20";
  if (changePercent > -1) return "bg-slate-700/50 border-slate-600/20";
  if (changePercent > -3) return "bg-red-800/80 border-red-600/30";
  return "bg-red-900 border-red-700/40";
}

/**
 * Returns CSS grid span for a tile based on market cap and category.
 * Container uses a 12-column CSS grid with dense auto-flow.
 */
function getTileSpan(marketCap: number | undefined, category: string): { col: number; row: number } {
  // Fixed sizes for non-equity categories
  if (category === "forex" || category === "bond") return { col: 2, row: 1 };
  if (category === "index") return { col: 2, row: 2 };
  if (category === "commodity") return { col: 2, row: 2 };
  if (category === "etf") return { col: 2, row: 2 };

  // Equity and crypto: scale by market cap
  if (!marketCap || marketCap <= 0) return { col: 1, row: 1 };
  if (marketCap > 1.5e12) return { col: 4, row: 4 };
  if (marketCap > 500e9)  return { col: 3, row: 3 };
  if (marketCap > 100e9)  return { col: 2, row: 2 };
  return { col: 1, row: 1 };
}

/** Format price with currency symbol */
function fmtPrice(value: number, currency: string): string {
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${sym}${value.toFixed(value > 100 ? 0 : 2)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeatmapView({ instruments, quotesBySymbol }: HeatmapViewProps) {
  const { language, currency } = useSettings();
  const [showAll, setShowAll] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("marketCap");

  // ── Data pipeline ──────────────────────────────────────────────────────────
  const { displayTiles, grouped, stats, totalValid } = useMemo(() => {
    // 1. Deduplicate by symbol
    const seen = new Set<string>();
    const deduped = instruments.filter((i) => {
      if (seen.has(i.symbol)) return false;
      seen.add(i.symbol);
      return true;
    });

    // 2. Validate quotes
    const validated = deduped.filter((i) => {
      const q = quotesBySymbol[i.symbol];
      return q && q.value > 0 && !isNaN(q.value) && !isNaN(q.changePercent);
    });

    // 3. Category filter
    const catFiltered =
      selectedCategories.length > 0
        ? validated.filter((i) => selectedCategories.includes(i.category))
        : validated;

    // 4. Sort by market cap for top-N selection (largest first)
    const byMcap = [...catFiltered].sort(
      (a, b) =>
        (quotesBySymbol[b.symbol]?.stats?.marketCap ?? 0) -
        (quotesBySymbol[a.symbol]?.stats?.marketCap ?? 0)
    );

    const totalValid = byMcap.length;

    // 5. Limit to top 100 unless showAll
    const limited = showAll ? byMcap : byMcap.slice(0, 100);

    // 6. Re-sort for display
    const sorted = [...limited].sort((a, b) => {
      const qA = quotesBySymbol[a.symbol];
      const qB = quotesBySymbol[b.symbol];
      if (!qA || !qB) return 0;
      if (sortBy === "change") return qB.changePercent - qA.changePercent;
      if (sortBy === "alphabetical") return a.symbol.localeCompare(b.symbol);
      return (qB.stats?.marketCap ?? 0) - (qA.stats?.marketCap ?? 0);
    });

    // 7. Group by category (preserving CATEGORY_ORDER)
    const grouped: Partial<Record<string, MarketInstrument[]>> = {};
    for (const cat of CATEGORY_ORDER) {
      const tiles = sorted.filter((i) => i.category === cat);
      if (tiles.length > 0) grouped[cat] = tiles;
    }

    // 8. Summary stats
    const gainers = limited.filter((i) => (quotesBySymbol[i.symbol]?.changePercent ?? 0) > 0).length;
    const losers  = limited.filter((i) => (quotesBySymbol[i.symbol]?.changePercent ?? 0) < 0).length;
    const avgChange =
      limited.length > 0
        ? limited.reduce((s, i) => s + (quotesBySymbol[i.symbol]?.changePercent ?? 0), 0) / limited.length
        : 0;

    return {
      displayTiles: limited,
      grouped,
      stats: { total: limited.length, gainers, losers, avgChange },
      totalValid,
    };
  }, [instruments, quotesBySymbol, selectedCategories, showAll, sortBy]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const lang = language;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-platform px-4 py-6 md:px-6">
      {/* Page header */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-text-primary">{t("marketHeatmap", lang)}</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          {lang === "it"
            ? "Visualizzazione in tempo reale delle performance di mercato per dimensione e variazione giornaliera."
            : "Real-time market performance visualization by size and daily price change."}
        </p>
      </div>

      {/* Layout: sidebar + main */}
      <div className="flex gap-8 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
        <MarketsSidebar />

        <div className="min-w-0 flex-1">
          {/* ── Summary bar ── */}
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-card border border-border-base bg-bg-secondary p-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-text-secondary">{t("assets", lang)}</p>
              <p className="text-xl font-bold text-text-primary">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t("gainers", lang)}</p>
              <p className="text-xl font-bold text-green-500">{stats.gainers}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t("losers", lang)}</p>
              <p className="text-xl font-bold text-red-500">{stats.losers}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t("avgChange", lang)}</p>
              <p className={`text-xl font-bold ${stats.avgChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.avgChange >= 0 ? "+" : ""}{stats.avgChange.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="mb-4 rounded-card border border-border-base bg-bg-secondary p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Category chips */}
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ORDER.map((cat) => {
                  const label = CATEGORY_DISPLAY[cat]?.[lang] ?? cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        selectedCategories.includes(cat)
                          ? "bg-cyan text-bg-primary"
                          : "bg-bg-primary text-text-secondary hover:bg-bg-hover"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="rounded border border-border-base bg-bg-primary px-2 py-1 text-xs text-text-primary focus:border-cyan focus:outline-none"
                >
                  <option value="marketCap">{t("marketCap", lang)}</option>
                  <option value="change">{t("dailyChange", lang)}</option>
                  <option value="alphabetical">{lang === "it" ? "Alfabetico" : "Alphabetical"}</option>
                </select>

                {/* Top 100 / Show All */}
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="rounded border border-border-base bg-bg-primary px-3 py-1 text-xs text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
                >
                  {showAll
                    ? `▲ Top 100`
                    : `${t("showAll", lang)} (${totalValid})`}
                </button>
              </div>
            </div>

            {/* Status line */}
            <p className="mt-3 text-[11px] text-text-muted">
              {lang === "it"
                ? `Mostrando ${stats.total} di ${totalValid} asset`
                : `Showing ${stats.total} of ${totalValid} assets`}
              {!showAll && totalValid > 100 && (lang === "it" ? " · ordinati per cap. mercato" : " · sorted by market cap")}
            </p>
          </div>

          {/* ── Legend ── */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-green-900" /> {lang === "it" ? "> +3%" : "> +3%"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-green-800/80" /> +1% to +3%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-slate-700/50 border border-slate-600/20" /> -1% to +1%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-red-800/80" /> -3% to -1%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-red-900" /> {"< -3%"}
            </span>
          </div>

          {/* ── Category sections ── */}
          {displayTiles.length === 0 ? (
            <div className="rounded-card border border-border-base bg-bg-secondary px-4 py-12 text-center text-text-secondary">
              {t("noResultsFilter", lang)}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {(Object.entries(grouped) as [string, MarketInstrument[]][]).map(([cat, tiles]) => {
                const catLabel = CATEGORY_DISPLAY[cat]?.[lang] ?? cat;
                const catMcap = tiles.reduce(
                  (sum, i) => sum + (quotesBySymbol[i.symbol]?.stats?.marketCap ?? 0),
                  0
                );
                const totalMcap = displayTiles.reduce(
                  (sum, i) => sum + (quotesBySymbol[i.symbol]?.stats?.marketCap ?? 0),
                  0
                );
                const weight = totalMcap > 0 ? (catMcap / totalMcap) * 100 : 0;

                return (
                  <div key={cat}>
                    {/* Section header */}
                    <div className="mb-2 flex items-baseline gap-3">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                        {catLabel}
                      </h2>
                      {weight > 0.5 && (
                        <span className="text-xs font-semibold text-cyan">
                          {weight.toFixed(1)}%
                        </span>
                      )}
                      <span className="text-xs text-text-muted">{tiles.length} {lang === "it" ? "asset" : "assets"}</span>
                    </div>

                    {/* Treemap grid */}
                    <div
                      className="rounded-card border border-border-base overflow-hidden"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(12, 1fr)",
                        gridAutoRows: "56px",
                        gridAutoFlow: "row dense",
                        gap: "3px",
                        padding: "3px",
                        background: "var(--bg-secondary, #0d1520)",
                      }}
                    >
                      {tiles.map((instrument) => {
                        const quote = quotesBySymbol[instrument.symbol];
                        if (!quote) return null;

                        const mcap = quote.stats?.marketCap;
                        const { col, row } = getTileSpan(mcap, instrument.category);
                        const isLarge = col >= 4 && row >= 4;
                        const isMed   = col >= 2 && row >= 2 && !isLarge;
                        const cp      = quote.changePercent;
                        const price   = quote.value;

                        return (
                          <Link
                            key={instrument.symbol}
                            href={`/asset/${instrument.symbol}`}
                            style={{
                              gridColumn: `span ${col}`,
                              gridRow: `span ${row}`,
                            }}
                            className={`relative flex flex-col items-center justify-center overflow-hidden rounded border transition-transform duration-150 hover:scale-[1.03] hover:z-10 hover:shadow-xl ${getTileColorClass(cp)}`}
                            title={`${instrument.name}\n${cp >= 0 ? "+" : ""}${cp.toFixed(2)}%  ·  ${fmtPrice(price, currency)}`}
                          >
                            {/* Large tile: name + symbol + change + price */}
                            {isLarge && (
                              <p className="mb-0.5 max-w-full truncate px-2 text-center text-[9px] text-white/50 leading-none">
                                {instrument.name}
                              </p>
                            )}

                            <p
                              className={`font-mono font-bold text-white leading-none ${
                                isLarge ? "text-base" : isMed ? "text-xs" : "text-[9px]"
                              }`}
                            >
                              {instrument.symbol}
                            </p>

                            {(isMed || isLarge) && (
                              <p
                                className={`font-mono font-semibold leading-none mt-0.5 ${
                                  cp >= 0 ? "text-green-200" : "text-red-200"
                                } ${isLarge ? "text-[11px]" : "text-[9px]"}`}
                              >
                                {cp >= 0 ? "+" : ""}{cp.toFixed(1)}%
                              </p>
                            )}

                            {isLarge && (
                              <p className="mt-0.5 font-mono text-[10px] text-white/60 leading-none">
                                {fmtPrice(price, currency)}
                              </p>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
