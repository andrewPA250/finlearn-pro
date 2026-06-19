"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import type { PortfolioHolding } from "@/lib/portfolio/types";
import { usePortfolio } from "@/lib/portfolio/PortfolioContext";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";
import { AddHoldingModal } from "./AddHoldingModal";
import { AssetLogo } from "@/components/ui/AssetLogo";
import { useCurrency } from "@/lib/currency/CurrencyContext";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(value: number | null | undefined, decimals = 2): string {
  if (value == null || isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function plColor(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "text-text-secondary";
  return value >= 0 ? "text-positive" : "text-negative";
}

const CATEGORY_COLORS: Record<string, string> = {
  equity: "bg-blue-500/10 text-blue-400",
  etf: "bg-purple-500/10 text-purple-400",
  crypto: "bg-orange-500/10 text-orange-400",
  index: "bg-cyan/10 text-cyan",
  forex: "bg-yellow-500/10 text-yellow-400",
  commodity: "bg-amber-500/10 text-amber-400",
  bond: "bg-green-500/10 text-green-400",
};

// ─── Row computation ─────────────────────────────────────────────────────────

interface HoldingRow {
  holding: PortfolioHolding;
  instrument: MarketInstrument | null;
  quote: TickerQuote | null;
  currentPrice: number | null;
  marketValue: number | null;
  costBasis: number;
  pl: number | null;
  plPct: number | null;
  allocationPct: number | null;
}

function buildRows(
  holdings: PortfolioHolding[],
  instrumentsBySymbol: Record<string, MarketInstrument>,
  quotesBySymbol: Record<string, TickerQuote>,
  totalMarketValue: number
): HoldingRow[] {
  return holdings.map((h) => {
    const instrument = instrumentsBySymbol[h.symbol] ?? null;
    const quote = quotesBySymbol[h.symbol] ?? null;
    const currentPrice = quote && quote.value > 0 ? quote.value : null;
    const costBasis = h.quantity * h.avgPrice;
    const marketValue = currentPrice != null ? h.quantity * currentPrice : null;
    const pl = marketValue != null ? marketValue - costBasis : null;
    const plPct = pl != null && costBasis > 0 ? (pl / costBasis) * 100 : null;
    const allocationPct =
      marketValue != null && totalMarketValue > 0 ? (marketValue / totalMarketValue) * 100 : null;
    return { holding: h, instrument, quote, currentPrice, marketValue, costBasis, pl, plPct, allocationPct };
  });
}

// ─── Main component ──────────────────────────────────────────────────────────

interface PortfolioViewProps {
  instruments: MarketInstrument[];
  instrumentsBySymbol: Record<string, MarketInstrument>;
}

export function PortfolioView({ instruments, instrumentsBySymbol }: PortfolioViewProps) {
  const { holdings, isHydrated, addHolding, updateHolding, removeHolding } = usePortfolio();
  const { language } = useSettings();
  const { formatMoney } = useCurrency();

  const [quotesBySymbol, setQuotesBySymbol] = useState<Record<string, TickerQuote>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<PortfolioHolding | null>(null);

  // Fetch quotes for current holdings
  const fetchQuotes = useCallback(async (syms: string[]) => {
    if (syms.length === 0) return;
    setQuotesLoading(true);
    try {
      const res = await fetch(`/api/quotes?symbols=${syms.join(",")}`);
      if (res.ok) {
        const data = (await res.json()) as Record<string, TickerQuote>;
        setQuotesBySymbol(data);
        setLastRefreshed(new Date());
      }
    } catch {
      // silently degrade — prices stay as "—"
    } finally {
      setQuotesLoading(false);
    }
  }, []);

  // Fetch on mount + whenever holdings change symbols
  const symbolsKey = holdings.map((h) => h.symbol).join(",");
  useEffect(() => {
    if (!isHydrated || holdings.length === 0) return;
    const seen = new Set<string>();
    const uniqueSymbols = holdings.map((h) => h.symbol).filter((s) => { if (seen.has(s)) return false; seen.add(s); return true; });
    fetchQuotes(uniqueSymbols);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, symbolsKey]);

  // Computed totals
  const totalMarketValue = useMemo(() => {
    return holdings.reduce((sum, h) => {
      const q = quotesBySymbol[h.symbol];
      if (!q || q.value <= 0) return sum;
      return sum + h.quantity * q.value;
    }, 0);
  }, [holdings, quotesBySymbol]);

  const totalCostBasis = useMemo(
    () => holdings.reduce((sum, h) => sum + h.quantity * h.avgPrice, 0),
    [holdings]
  );

  const totalPL = totalMarketValue > 0 ? totalMarketValue - totalCostBasis : null;
  const totalPLPct = totalPL != null && totalCostBasis > 0 ? (totalPL / totalCostBasis) * 100 : null;

  const rows = useMemo(
    () => buildRows(holdings, instrumentsBySymbol, quotesBySymbol, totalMarketValue),
    [holdings, instrumentsBySymbol, quotesBySymbol, totalMarketValue]
  );

  // Insights: show if holdings exist, even if prices loading
  const rowsWithPL = rows.filter((r) => r.plPct != null);
  const bestRow = rowsWithPL.reduce<HoldingRow | null>((best, r) => !best || r.plPct! > best.plPct! ? r : best, null);
  const worstRow = rowsWithPL.reduce<HoldingRow | null>((worst, r) => !worst || r.plPct! < worst.plPct! ? r : worst, null);
  const rowsWithAlloc = rows.filter((r) => r.allocationPct != null);
  const largestRow = rowsWithAlloc.reduce<HoldingRow | null>((big, r) => !big || r.allocationPct! > big.allocationPct! ? r : big, null);
  const hasInsights = holdings.length > 0;

  // Allocation: show if holdings with instruments exist
  const hasAllocation = holdings.some((h) => instrumentsBySymbol[h.symbol] != null);

  function openAdd() {
    setEditingHolding(null);
    setModalOpen(true);
  }
  function openEdit(holding: PortfolioHolding) {
    setEditingHolding(holding);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditingHolding(null);
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (isHydrated && holdings.length === 0) {
    return (
      <>
        <div className="mx-auto max-w-platform px-4 py-12 md:px-6">
          <div className="mb-6 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-text-primary">{t("portfolio", language)}</h1>
            <p className="mt-0.5 text-sm text-text-secondary">
              {t("trackInvestments", language)}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-card bg-bg-card/40 px-6 py-16 text-center animate-fade-in-up" style={{ animationDelay: "40ms" }}>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan/10">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-cyan" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M7 12l4-4 3 3 5-5" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-text-primary">{t("yourPortfolioIsEmpty", language)}</h2>
            <p className="mb-6 max-w-sm text-sm text-text-secondary">
              {t("addFirstHolding", language)}
            </p>
            <button
              onClick={openAdd}
              className="rounded-card bg-cyan px-5 py-2.5 text-sm font-semibold text-bg-primary hover:bg-cyan/90 transition"
            >
              {t("addFirstHoldingBtn", language)}
            </button>
          </div>
        </div>
        {modalOpen && (
          <AddHoldingModal
            instruments={instruments}
            editing={editingHolding}
            onSave={addHolding}
            onUpdate={updateHolding}
            onClose={closeModal}
          />
        )}
      </>
    );
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-platform px-4 py-12 md:px-6">
        <div className="h-8 w-40 animate-pulse rounded bg-bg-card" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-card bg-bg-card" />
          ))}
        </div>
      </div>
    );
  }

  // ── Full view ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="mx-auto max-w-platform px-4 py-6 md:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t("portfolio", language)}</h1>
            <p className="mt-0.5 text-sm text-text-secondary">
              {holdings.length} {holdings.length !== 1 ? t("holdings", language) : t("holding", language)}
              {lastRefreshed && (
                <span className="ml-2 text-text-muted">
                  · {t("updated", language)} {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const seen = new Set<string>();
    const uniqueSymbols = holdings.map((h) => h.symbol).filter((s) => { if (seen.has(s)) return false; seen.add(s); return true; });
                fetchQuotes(uniqueSymbols);
              }}
              disabled={quotesLoading}
              className="rounded bg-bg-card/50 px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover transition disabled:opacity-50"
            >
              {quotesLoading ? t("refreshing", language) : t("refresh", language)}
            </button>
            <button
              onClick={openAdd}
              className="rounded bg-cyan px-4 py-1.5 text-sm font-semibold text-bg-primary hover:bg-cyan/90 transition"
            >
              {t("addHolding", language)}
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
          <SummaryCard
            label={t("marketValue", language)}
            value={totalMarketValue > 0 ? formatMoney(totalMarketValue) : "—"}
          />
          <SummaryCard
            label={t("costBasis", language)}
            value={totalCostBasis > 0 ? formatMoney(totalCostBasis) : "—"}
          />
          <SummaryCard
            label={t("unrealizedPL", language)}
            value={totalPL != null ? formatMoney(totalPL) : "—"}
            valueClass={plColor(totalPL)}
          />
          <SummaryCard
            label={t("plPercent", language)}
            value={totalPLPct != null ? fmtPct(totalPLPct) : "—"}
            valueClass={plColor(totalPLPct)}
          />
        </div>

        {/* Insights row */}
        {hasInsights && (
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("insights", language)}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InsightCard label={t("bestPerformer", language)} symbol={bestRow?.holding.symbol ?? null} value={bestRow ? fmtPct(bestRow.plPct) : "—"} valueClass={bestRow ? plColor(bestRow.plPct) : "text-text-muted"} instrument={bestRow?.instrument ?? null} />
              <InsightCard label={t("worstPerformer", language)} symbol={worstRow?.holding.symbol ?? null} value={worstRow ? fmtPct(worstRow.plPct) : "—"} valueClass={worstRow ? plColor(worstRow.plPct) : "text-text-muted"} instrument={worstRow?.instrument ?? null} />
              <InsightCard label={t("largestPosition", language)} symbol={largestRow?.holding.symbol ?? null} value={largestRow?.allocationPct != null ? `${largestRow.allocationPct.toFixed(1)}%` : "—"} valueClass="text-text-primary" instrument={largestRow?.instrument ?? null} />
            </div>
          </div>
        )}

        {/* Allocation sections */}
        {hasAllocation && (
          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <div className="rounded-card bg-bg-card/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("allocation", language)}</p>
              <div className="space-y-2.5">
                {[...rows].filter((r) => r.allocationPct != null).sort((a, b) => (b.allocationPct ?? 0) - (a.allocationPct ?? 0)).slice(0, 10).map((row) => (
                  <div key={row.holding.id} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 truncate text-right font-mono text-sm text-text-secondary">{row.holding.symbol}</span>
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-bg-primary">
                      <div className="h-full rounded-full bg-cyan/70 transition-all duration-500" style={{ width: `${Math.min(row.allocationPct ?? 0, 100)}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right font-mono text-sm text-text-secondary">{row.allocationPct?.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-card bg-bg-card/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("allocationByCategory", language)}</p>
              <div className="space-y-2.5">
                {Object.entries(
                  holdings.reduce<Record<string, number>>((acc, h) => {
                    const inst = instrumentsBySymbol[h.symbol];
                    if (inst) {
                      const q = quotesBySymbol[h.symbol];
                      if (q && q.value > 0) {
                        const val = h.quantity * q.value;
                        acc[inst.category] = (acc[inst.category] ?? 0) + val;
                      }
                    }
                    return acc;
                  }, {})
                ).sort((a, b) => b[1] - a[1]).map(([cat, val]) => {
                  const total = totalMarketValue > 0 ? totalMarketValue : 1;
                  const pct = (val / total) * 100;
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <span className="w-20 shrink-0 truncate text-right font-mono text-sm text-text-secondary">{cat}</span>
                      <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-bg-primary">
                        <div className="h-full rounded-full transition-all duration-500 bg-cyan" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className="w-10 shrink-0 text-right font-mono text-sm text-text-secondary">{pct.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Holdings table */}
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary animate-fade-in-up" style={{ animationDelay: "80ms" }}>{t("holdings", language)}</p>
        <div className="rounded-card bg-bg-card/40 overflow-hidden animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-card/60">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary whitespace-nowrap">{t("symbol", language)}</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary whitespace-nowrap hidden md:table-cell">{t("name", language)}</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary whitespace-nowrap hidden lg:table-cell">{t("category", language)}</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary whitespace-nowrap">{t("quantity", language)}</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary whitespace-nowrap">{t("avgPrice", language)}</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary whitespace-nowrap">{t("current", language)}</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary whitespace-nowrap hidden sm:table-cell">{t("value", language)}</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary whitespace-nowrap hidden sm:table-cell">{t("cost", language)}</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary whitespace-nowrap">P/L</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary whitespace-nowrap">P/L %</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary whitespace-nowrap hidden md:table-cell">{t("allocation", language)}</th>
                  <th className="px-4 py-3 text-center font-semibold text-text-secondary whitespace-nowrap">{t("actions", language)}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ holding, instrument, currentPrice, marketValue, costBasis, pl, plPct, allocationPct }) => (
                  <tr key={holding.id} className="hover:bg-bg-hover transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {instrument && (
                          <AssetLogo
                            symbol={instrument.finnhubSymbol ?? holding.symbol}
                            name={instrument.name}
                            category={instrument.category}
                            size="sm"
                          />
                        )}
                        <Link
                          href={`/asset/${holding.symbol}`}
                          className="font-mono font-semibold text-cyan hover:underline"
                        >
                          {holding.symbol}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {instrument ? (
                        <Link href={`/asset/${holding.symbol}`} className="hover:text-text-primary hover:underline">
                          {instrument.name}
                        </Link>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {instrument ? (
                        <span className={`rounded px-2 py-0.5 text-xs ${CATEGORY_COLORS[instrument.category] ?? "bg-bg-primary text-text-muted"}`}>
                          {instrument.category}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">
                      {fmt(holding.quantity, holding.quantity % 1 === 0 ? 0 : 4)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">
                      {formatMoney(holding.avgPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {quotesLoading && !quotesBySymbol[holding.symbol] ? (
                        <span className="inline-block h-3 w-16 animate-pulse rounded bg-bg-primary" />
                      ) : currentPrice != null ? (
                        <span className="text-text-primary">{formatMoney(currentPrice)}</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary hidden sm:table-cell">
                      {marketValue != null ? formatMoney(marketValue) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-secondary hidden sm:table-cell">
                      {formatMoney(costBasis)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${plColor(pl)}`}>
                      {pl != null ? formatMoney(pl) : "—"}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${plColor(plPct)}`}>
                      {plPct != null ? fmtPct(plPct) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-secondary hidden md:table-cell">
                      {allocationPct != null ? `${allocationPct.toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(holding)}
                          className="text-xs text-text-secondary hover:text-cyan transition"
                          title={t("editHolding", language)}
                        >
                          {t("edit", language)}
                        </button>
                        <button
                          onClick={() => removeHolding(holding.id)}
                          className="text-xs text-text-muted hover:text-negative transition"
                          title={t("removeHolding", language)}
                        >
                          {t("remove", language)}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes footnote */}
        <p className="mt-4 text-xs text-text-muted animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          {t("pricesDelayed", language)}
        </p>
      </div>

      {modalOpen && (
        <AddHoldingModal
          instruments={instruments}
          editing={editingHolding}
          onSave={addHolding}
          onUpdate={updateHolding}
          onClose={closeModal}
        />
      )}
    </>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  valueClass = "text-text-primary",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-card bg-bg-card/40 p-4">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className={`mt-1 text-2xl font-bold font-mono ${valueClass}`}>{value}</p>
    </div>
  );
}

function InsightCard({ label, symbol, value, valueClass, instrument }: { label: string; symbol: string | null; value: string; valueClass: string; instrument: MarketInstrument | null }) {
  return (
    <div className="rounded-card bg-bg-card/40 p-4">
      <p className="mb-2 text-xs text-text-secondary">{label}</p>
      {symbol ? (
        <div className="flex items-center gap-2">
          {instrument && (<AssetLogo symbol={instrument.finnhubSymbol ?? symbol} name={instrument.name} category={instrument.category} size="sm" />)}
          <div>
            <p className="font-mono text-base font-semibold text-text-primary">{symbol}</p>
            <p className={`font-mono text-lg font-bold ${valueClass}`}>{value}</p>
          </div>
        </div>
      ) : (
        <p className="text-text-muted">—</p>
      )}
    </div>
  );
}
