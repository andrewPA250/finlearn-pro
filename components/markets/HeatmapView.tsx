"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import type { Language } from "@/lib/settings/types";
import { MarketsSidebar } from "@/components/markets/MarketsSidebar";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import { AssetLogo } from "@/components/ui/AssetLogo";

// ── Types ─────────────────────────────────────────────────────────────────────

interface HeatmapViewProps {
  instruments: MarketInstrument[];
  quotesBySymbol: Record<string, TickerQuote>;
}

type SortBy     = "marketCap" | "gainers" | "losers" | "volume" | "alphabetical";
type SizingMode = "equal" | "marketCap" | "volume";
type ContentLevel = "sm" | "md" | "lg" | "xl";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_ORDER = ["equity", "crypto", "etf", "index", "commodity", "forex", "bond"] as const;

const CAT_LABEL: Record<string, { en: string; it: string }> = {
  equity:    { en: "Stocks",      it: "Azioni"       },
  etf:       { en: "ETFs",        it: "ETF"           },
  index:     { en: "Indices",     it: "Indici"        },
  crypto:    { en: "Crypto",      it: "Crypto"        },
  commodity: { en: "Commodities", it: "Materie Prime" },
  forex:     { en: "Forex",       it: "Forex"         },
  bond:      { en: "Bonds",       it: "Obbligazioni"  },
};

const CAT_BADGE: Record<string, string> = {
  equity:    "bg-blue-500/20 text-blue-300",
  etf:       "bg-purple-500/20 text-purple-300",
  index:     "bg-cyan/20 text-cyan",
  crypto:    "bg-orange-500/20 text-orange-300",
  commodity: "bg-amber-500/20 text-amber-300",
  forex:     "bg-yellow-500/20 text-yellow-300",
  bond:      "bg-green-500/20 text-green-300",
};

const SORT_LABELS: Record<SortBy, { en: string; it: string }> = {
  gainers:      { en: "↑ Gainers",  it: "↑ Migliori" },
  losers:       { en: "↓ Losers",   it: "↓ Peggiori" },
  volume:       { en: "High Vol",   it: "Alto Vol"    },
  marketCap:    { en: "Market Cap", it: "Cap."        },
  alphabetical: { en: "A–Z",        it: "A–Z"         },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function tileColor(cp: number): string {
  if (cp >  5) return "bg-emerald-950 border-emerald-600/60";
  if (cp >  3) return "bg-green-900   border-green-600/50";
  if (cp >  1) return "bg-green-800/80 border-green-600/30";
  if (cp >  0) return "bg-green-700/35 border-green-500/20";
  if (cp > -1) return "bg-red-700/35   border-red-500/20";
  if (cp > -3) return "bg-red-800/80   border-red-600/30";
  if (cp > -5) return "bg-red-900      border-red-700/50";
  return               "bg-red-950     border-red-800/60";
}

function spanByMcap(mcap: number | undefined, cat: string): { col: number; row: number } {
  if (cat === "forex" || cat === "bond")                       return { col: 2, row: 1 };
  if (cat === "index" || cat === "commodity" || cat === "etf") return { col: 2, row: 2 };
  if (!mcap || mcap <= 0)                                      return { col: 1, row: 1 };
  if (mcap > 1.5e12) return { col: 4, row: 4 };
  if (mcap > 500e9)  return { col: 3, row: 3 };
  if (mcap > 100e9)  return { col: 2, row: 2 };
  return { col: 1, row: 1 };
}

function spanByVolume(vol: number | undefined): { col: number; row: number } {
  if (!vol || vol <= 0) return { col: 1, row: 1 };
  if (vol > 100e6) return { col: 4, row: 4 };
  if (vol >  50e6) return { col: 3, row: 3 };
  if (vol >  10e6) return { col: 2, row: 2 };
  return { col: 1, row: 1 };
}

function fmtVol(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
}

// ── Tile ──────────────────────────────────────────────────────────────────────

interface TileProps {
  instrument: MarketInstrument;
  quote: TickerQuote;
  gridSpan: { col: number; row: number } | null;
  level: ContentLevel;
  dimmed: boolean;
  formatMoney: (v: number) => string;
  lang: Language;
  showLogo: boolean;
}

function HeatmapTile({ instrument, quote, gridSpan, level, dimmed, formatMoney, lang, showLogo }: TileProps) {
  const cp        = quote.changePercent;
  const price     = quote.value;
  const changeStr = `${cp >= 0 ? "+" : ""}${cp.toFixed(2)}%`;
  const priceStr  = price > 0 ? formatMoney(price) : "—";
  const color     = tileColor(cp);
  const catLabel  = CAT_LABEL[instrument.category]?.[lang] ?? instrument.category;
  const catBadge  = CAT_BADGE[instrument.category] ?? "bg-bg-hover text-text-secondary";
  const vol       = quote.stats?.volume;

  const spanStyle = gridSpan
    ? { gridColumn: `span ${gridSpan.col}`, gridRow: `span ${gridSpan.row}` }
    : {};

  return (
    <Link
      href={`/asset/${instrument.symbol}`}
      style={spanStyle}
      className={`group relative z-0 hover:z-10 transition-opacity duration-200 ${dimmed ? "opacity-25" : "opacity-100"}`}
    >
      {/* Tile body */}
      <div
        className={`absolute inset-0 overflow-hidden rounded border flex flex-col items-center justify-center p-1
          transition-transform duration-150 group-hover:scale-[1.05] group-hover:shadow-2xl ${color}`}
      >
        {/* Logo — LG / XL tiles in span mode only */}
        {showLogo && (
          <div className="mb-0.5 shrink-0">
            <AssetLogo
              symbol={instrument.symbol}
              name={instrument.name}
              category={instrument.category}
              size="sm"
            />
          </div>
        )}

        {/* Company name — XL only */}
        {level === "xl" && (
          <p className="max-w-full truncate px-1 text-center text-[9px] text-white/40 leading-none mb-0.5">
            {instrument.name}
          </p>
        )}

        {/* Symbol */}
        <p className={`font-mono font-bold text-white leading-none ${
          level === "xl" ? "text-sm"
          : level === "lg" ? "text-xs"
          : level === "md" ? "text-[10px]"
          : "text-[8px]"
        }`}>
          {instrument.symbol}
        </p>

        {/* Change % */}
        {level !== "sm" && (
          <p className={`font-mono font-semibold leading-none mt-0.5 ${
            cp >= 0 ? "text-green-200" : "text-red-200"
          } ${level === "xl" ? "text-[11px]" : "text-[9px]"}`}>
            {changeStr}
          </p>
        )}

        {/* Price */}
        {level !== "sm" && price > 0 && (
          <p className={`font-mono text-white/55 leading-none mt-0.5 ${level === "xl" ? "text-[10px]" : "text-[8px]"}`}>
            {priceStr}
          </p>
        )}

        {/* Category badge — LG / XL */}
        {(level === "lg" || level === "xl") && (
          <span className={`mt-1 rounded px-1 py-0.5 text-[7px] font-bold uppercase tracking-wide ${catBadge}`}>
            {catLabel}
          </span>
        )}
      </div>

      {/* Hover tooltip — not clipped by tile overflow-hidden since it's a sibling */}
      <div
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-50 w-52 -translate-x-1/2
          rounded-lg border border-bg-border bg-bg-card px-3 py-2.5 shadow-2xl
          opacity-0 group-hover:opacity-100 transition-opacity duration-100"
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-text-primary font-mono">{instrument.symbol}</p>
            <p className="text-[10px] text-text-muted truncate leading-snug">{instrument.name}</p>
          </div>
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${catBadge}`}>
            {catLabel}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-text-primary font-mono">{priceStr}</span>
          <span className={`text-xs font-bold ${cp >= 0 ? "text-positive" : "text-negative"}`}>
            {changeStr}
          </span>
        </div>
        {vol && vol > 0 && (
          <p className="mt-1 text-[9px] text-text-muted">
            Vol: {fmtVol(vol)}
          </p>
        )}
        <p className="mt-1.5 text-[9px] text-cyan text-right">
          {lang === "it" ? "Apri asset →" : "Open asset →"}
        </p>
      </div>
    </Link>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function HeatmapView({ instruments, quotesBySymbol }: HeatmapViewProps) {
  const { language } = useSettings();
  const { formatMoneyCompact } = useCurrency();
  const lang = language;

  const [sizingMode, setSizingMode]               = useState<SizingMode>("equal");
  const [searchQuery, setSearchQuery]             = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy]                       = useState<SortBy>("marketCap");
  const [showAll, setShowAll]                     = useState(false);

  // ── Data pipeline ────────────────────────────────────────────────────────────
  const { grouped, stats, totalValid } = useMemo(() => {
    const seen = new Set<string>();
    const deduped = instruments.filter((i) => {
      if (seen.has(i.symbol)) return false;
      seen.add(i.symbol);
      return true;
    });

    const validated = deduped.filter((i) => {
      const q = quotesBySymbol[i.symbol];
      return q && q.value > 0 && !isNaN(q.value) && !isNaN(q.changePercent);
    });

    const catFiltered =
      selectedCategories.length > 0
        ? validated.filter((i) => selectedCategories.includes(i.category))
        : validated;

    const sorted = [...catFiltered].sort((a, b) => {
      const qA = quotesBySymbol[a.symbol];
      const qB = quotesBySymbol[b.symbol];
      if (!qA || !qB) return 0;
      if (sortBy === "gainers")      return qB.changePercent - qA.changePercent;
      if (sortBy === "losers")       return qA.changePercent - qB.changePercent;
      if (sortBy === "volume")       return (qB.stats?.volume ?? 0) - (qA.stats?.volume ?? 0);
      if (sortBy === "alphabetical") return a.symbol.localeCompare(b.symbol);
      return (qB.stats?.marketCap ?? 0) - (qA.stats?.marketCap ?? 0);
    });

    const totalValid = sorted.length;
    const limited    = showAll ? sorted : sorted.slice(0, 100);

    const grouped: Partial<Record<string, MarketInstrument[]>> = {};
    for (const cat of CATEGORY_ORDER) {
      const tiles = limited.filter((i) => i.category === cat);
      if (tiles.length > 0) grouped[cat] = tiles;
    }

    const gainers = limited.filter((i) => (quotesBySymbol[i.symbol]?.changePercent ?? 0) > 0).length;
    const losers  = limited.filter((i) => (quotesBySymbol[i.symbol]?.changePercent ?? 0) < 0).length;
    const avgChange =
      limited.length > 0
        ? limited.reduce((s, i) => s + (quotesBySymbol[i.symbol]?.changePercent ?? 0), 0) / limited.length
        : 0;

    return {
      grouped,
      stats: { total: limited.length, gainers, losers, avgChange },
      totalValid,
    };
  }, [instruments, quotesBySymbol, selectedCategories, showAll, sortBy]);

  // ── Search matches ───────────────────────────────────────────────────────────
  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    const set = new Set<string>();
    for (const tiles of Object.values(grouped)) {
      (tiles as MarketInstrument[]).forEach((i) => {
        if (i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)) {
          set.add(i.symbol);
        }
      });
    }
    return set;
  }, [grouped, searchQuery]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const catEntries = Object.entries(grouped) as [string, MarketInstrument[]][];
  const totalDisplayed = catEntries.reduce((s, [, tiles]) => s + tiles.length, 0);
  const totalMcap = catEntries.reduce(
    (s, [, tiles]) => s + tiles.reduce((ss, i) => ss + (quotesBySymbol[i.symbol]?.stats?.marketCap ?? 0), 0),
    0
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-platform px-4 py-6 md:px-6">
      {/* Page header */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-text-primary">{t("marketHeatmap", lang)}</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          {lang === "it"
            ? "Visualizzazione in tempo reale delle performance di mercato per variazione giornaliera."
            : "Real-time market performance visualization by daily price change."}
        </p>
      </div>

      {/* Layout: sidebar + main */}
      <div className="flex gap-8 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
        <MarketsSidebar />

        <div className="min-w-0 flex-1">
          {/* ── Summary bar ── */}
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-card border border-bg-border bg-bg-card p-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-text-secondary">{t("assets", lang)}</p>
              <p className="text-xl font-bold text-text-primary">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t("gainers", lang)}</p>
              <p className="text-xl font-bold text-positive">{stats.gainers}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t("losers", lang)}</p>
              <p className="text-xl font-bold text-negative">{stats.losers}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t("avgChange", lang)}</p>
              <p className={`text-xl font-bold ${stats.avgChange >= 0 ? "text-positive" : "text-negative"}`}>
                {stats.avgChange >= 0 ? "+" : ""}{stats.avgChange.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="mb-4 rounded-card border border-bg-border bg-bg-card p-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-text-muted select-none">
                ⌕
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "it" ? "Cerca simbolo o nome…" : "Search symbol or name…"}
                className="w-full rounded border border-bg-border bg-bg-primary pl-7 pr-8 py-1.5 text-sm
                  text-text-primary placeholder-text-muted focus:border-cyan focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category filter chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategories([])}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedCategories.length === 0
                    ? "bg-cyan text-bg-primary"
                    : "bg-bg-primary text-text-secondary hover:bg-bg-hover"
                }`}
              >
                {lang === "it" ? "Tutto" : "All"}
              </button>
              {CATEGORY_ORDER.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedCategories.includes(cat)
                      ? "bg-cyan text-bg-primary"
                      : "bg-bg-primary text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  {CAT_LABEL[cat]?.[lang] ?? cat}
                </button>
              ))}
            </div>

            {/* Sort + Sizing + Show All */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Sort quick buttons */}
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(SORT_LABELS) as SortBy[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`rounded border px-2.5 py-1 text-xs font-medium transition ${
                      sortBy === s
                        ? "border-cyan bg-cyan/10 text-cyan"
                        : "border-bg-border bg-bg-primary text-text-secondary hover:bg-bg-hover"
                    }`}
                  >
                    {SORT_LABELS[s][lang]}
                  </button>
                ))}
              </div>

              {/* Sizing select + Show All */}
              <div className="flex items-center gap-2">
                <select
                  value={sizingMode}
                  onChange={(e) => setSizingMode(e.target.value as SizingMode)}
                  className="rounded border border-bg-border bg-bg-primary px-2 py-1 text-xs text-text-primary
                    focus:border-cyan focus:outline-none"
                >
                  <option value="equal">{lang === "it" ? "Uguale" : "Equal Size"}</option>
                  <option value="marketCap">{lang === "it" ? "Cap. Mercato" : "Market Cap"}</option>
                  <option value="volume">{lang === "it" ? "Volume" : "By Volume"}</option>
                </select>
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="rounded border border-bg-border bg-bg-primary px-3 py-1 text-xs
                    text-text-secondary transition hover:bg-bg-hover hover:text-text-primary"
                >
                  {showAll ? `▲ Top 100` : `${t("showAll", lang)} (${totalValid})`}
                </button>
              </div>
            </div>

            {/* Status line */}
            <p className="text-[11px] text-text-muted">
              {lang === "it"
                ? `${totalDisplayed} di ${totalValid} asset`
                : `${totalDisplayed} of ${totalValid} assets`}
              {!showAll && totalValid > 100 && (
                <span className="ml-1 text-text-muted/60">
                  {lang === "it" ? "· ordinati per: " : "· sorted: "}
                  {SORT_LABELS[sortBy][lang]}
                </span>
              )}
              {searchMatches !== null && (
                <span className="ml-2 text-cyan">
                  · {searchMatches.size} {lang === "it" ? "trovati" : "matching"}
                </span>
              )}
            </p>
          </div>

          {/* ── Legend ── */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] text-text-muted">
            {[
              { cls: "bg-emerald-950 border-emerald-600/60", label: "> +5%" },
              { cls: "bg-green-900 border-green-600/50",     label: "+3%–+5%" },
              { cls: "bg-green-800/80 border-green-600/30",  label: "+1%–+3%" },
              { cls: "bg-green-700/35 border-green-500/20",  label: "0–+1%" },
              { cls: "bg-red-700/35 border-red-500/20",      label: "-1%–0" },
              { cls: "bg-red-800/80 border-red-600/30",      label: "-3%–-1%" },
              { cls: "bg-red-900 border-red-700/50",         label: "-5%–-3%" },
              { cls: "bg-red-950 border-red-800/60",         label: "< -5%" },
            ].map(({ cls, label }) => (
              <span key={label} className="flex items-center gap-1">
                <span className={`h-2.5 w-2.5 rounded-sm border ${cls}`} />
                {label}
              </span>
            ))}
          </div>

          {/* ── Category sections ── */}
          {catEntries.length === 0 ? (
            <div className="rounded-card border border-bg-border bg-bg-card px-4 py-12 text-center text-text-secondary">
              {searchQuery ? t("noResultsFilter", lang) : t("noResultsFilter", lang)}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {catEntries.map(([cat, tiles]) => {
                const catLabelStr = CAT_LABEL[cat]?.[lang] ?? cat;
                const catMcap = tiles.reduce(
                  (s, i) => s + (quotesBySymbol[i.symbol]?.stats?.marketCap ?? 0),
                  0
                );
                const weight = totalMcap > 0 ? (catMcap / totalMcap) * 100 : 0;

                const isEqualMode = sizingMode === "equal";

                const gridStyle: React.CSSProperties = isEqualMode
                  ? {
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(82px, 1fr))",
                      gridAutoRows: "82px",
                      gap: "3px",
                      padding: "3px",
                    }
                  : {
                      display: "grid",
                      gridTemplateColumns: "repeat(12, 1fr)",
                      gridAutoRows: "56px",
                      gridAutoFlow: "row dense",
                      gap: "3px",
                      padding: "3px",
                    };

                return (
                  <div key={cat}>
                    {/* Section header */}
                    <div className="mb-2 flex items-baseline gap-3">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                        {catLabelStr}
                      </h2>
                      {weight > 0.5 && (
                        <span className="text-xs font-semibold text-cyan">{weight.toFixed(1)}%</span>
                      )}
                      <span className="text-xs text-text-muted">
                        {tiles.length} {lang === "it" ? "asset" : "assets"}
                      </span>
                    </div>

                    {/* Grid */}
                    <div
                      className="rounded-card border border-bg-border"
                      style={{ background: "var(--bg-secondary, #0d1520)", overflow: "visible", ...gridStyle }}
                    >
                      {tiles.map((instrument) => {
                        const quote = quotesBySymbol[instrument.symbol];
                        if (!quote) return null;

                        const mcap = quote.stats?.marketCap;
                        const vol  = quote.stats?.volume;

                        let span: { col: number; row: number } | null = null;
                        let level: ContentLevel = "md";

                        if (!isEqualMode) {
                          const s = sizingMode === "volume" ? spanByVolume(vol) : spanByMcap(mcap, cat);
                          span = s;
                          if      (s.col >= 4) level = "xl";
                          else if (s.col >= 3) level = "lg";
                          else if (s.col >= 2) level = "md";
                          else                 level = "sm";
                        }

                        // Only render logos on LG/XL span tiles — limits fetches to ~10–20 max
                        const showLogo = !isEqualMode && (level === "xl" || level === "lg");
                        const dimmed   = searchMatches !== null && !searchMatches.has(instrument.symbol);

                        return (
                          <HeatmapTile
                            key={instrument.symbol}
                            instrument={instrument}
                            quote={quote}
                            gridSpan={span}
                            level={level}
                            dimmed={dimmed}
                            formatMoney={formatMoneyCompact}
                            lang={lang}
                            showLogo={showLogo}
                          />
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
