/**
 * AI Analyst — client-side structured context assembly.
 *
 * Turns the live app state (catalog, portfolio, watchlist, alerts, settings)
 * plus a freshly-fetched quote map into a clean `AiContext`. This is the single
 * place that decides *what* the model gets to see — the model never receives
 * raw page text, only this typed snapshot.
 *
 * Quotes arrive from the existing `/api/quotes` endpoint (a `symbol → quote`
 * map). Any symbol missing from that map yields `null` values, which the prompt
 * builder renders as "unavailable" rather than guessing.
 */

import type { TickerQuote } from "@/lib/market/ticker";
import type { PortfolioHolding } from "@/lib/portfolio/types";
import type { PriceAlert } from "@/lib/alerts/types";
import { getInstrumentBySymbol } from "@/lib/markets/catalog";
import { ALERT_TYPE_LABELS } from "@/lib/alerts/types";
import type {
  AiContext,
  AiMarketSnapshotItem,
  AiPortfolioContext,
  AiAssetContext,
} from "./types";

/** Key symbols summarised for "what changed in markets today?". */
export const SNAPSHOT_SYMBOLS: { symbol: string; label: string }[] = [
  { symbol: "SPX", label: "S&P 500" },
  { symbol: "NDX", label: "Nasdaq 100" },
  { symbol: "BTCUSD", label: "Bitcoin" },
  { symbol: "XAUUSD", label: "Gold" },
  { symbol: "EURUSD", label: "EUR/USD" },
  { symbol: "US10Y", label: "10Y Treasury" },
];

interface BuildContextArgs {
  language: "en" | "it";
  currency: string;
  holdings: PortfolioHolding[];
  watchlist: string[];
  alerts: PriceAlert[];
  quotes: Record<string, TickerQuote>;
  focusSymbol?: string | null;
}

/** Collect every symbol whose quote the AI context will need. */
export function collectSymbols(args: {
  holdings: PortfolioHolding[];
  watchlist: string[];
  focusSymbol?: string | null;
}): string[] {
  const set = new Set<string>();
  for (const s of SNAPSHOT_SYMBOLS) set.add(s.symbol);
  for (const h of args.holdings) set.add(h.symbol.toUpperCase());
  for (const w of args.watchlist) set.add(w.toUpperCase());
  if (args.focusSymbol) set.add(args.focusSymbol.toUpperCase());
  return Array.from(set);
}

function buildPortfolio(
  holdings: PortfolioHolding[],
  quotes: Record<string, TickerQuote>,
  currency: string
): AiPortfolioContext | null {
  if (holdings.length === 0) return null;

  let totalCostBasis = 0;
  let totalMarketValue: number | null = 0;
  let anyValueMissing = false;

  const mapped = holdings.map((h) => {
    const sym = h.symbol.toUpperCase();
    const q = quotes[sym];
    const price = q ? q.value : null;
    const marketValue = price != null ? price * h.quantity : null;
    const cost = h.avgPrice * h.quantity;
    const plPct =
      price != null && h.avgPrice > 0 ? ((price - h.avgPrice) / h.avgPrice) * 100 : null;

    totalCostBasis += cost;
    if (marketValue == null) anyValueMissing = true;
    else if (totalMarketValue != null) totalMarketValue += marketValue;

    return { symbol: sym, quantity: h.quantity, avgPrice: h.avgPrice, price, marketValue, plPct };
  });

  // If we couldn't price every holding, total market value is not trustworthy.
  if (anyValueMissing) totalMarketValue = null;

  return {
    currency,
    holdingsCount: holdings.length,
    totalCostBasis,
    totalMarketValue,
    holdings: mapped,
  };
}

function buildSelectedAsset(
  focusSymbol: string | null | undefined,
  quotes: Record<string, TickerQuote>,
  currency: string
): AiAssetContext | null {
  if (!focusSymbol) return null;
  const sym = focusSymbol.toUpperCase();
  const instrument = getInstrumentBySymbol(sym);
  if (!instrument) return null;

  const q = quotes[sym];
  const stats = q?.stats;
  return {
    symbol: instrument.symbol,
    name: instrument.name,
    category: instrument.category,
    currency,
    price: q ? q.value : null,
    changePercent: q ? q.changePercent : null,
    fiftyTwoWeekHigh: stats?.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: stats?.fiftyTwoWeekLow ?? null,
    pe: stats?.pe ?? null,
    marketCap: stats?.marketCap ?? null,
  };
}

function buildSnapshot(quotes: Record<string, TickerQuote>): AiMarketSnapshotItem[] {
  return SNAPSHOT_SYMBOLS.map(({ symbol, label }) => {
    const q = quotes[symbol];
    return {
      symbol,
      label,
      price: q ? q.value : null,
      changePercent: q ? q.changePercent : null,
    };
  });
}

export function buildAiContext(args: BuildContextArgs): AiContext {
  const { language, currency, holdings, watchlist, alerts, quotes, focusSymbol } = args;

  const activeAlerts = alerts.filter((a) => a.enabled && !a.triggeredAt).length;
  const triggeredAlerts = alerts.filter((a) => a.triggeredAt).length;

  return {
    language,
    selectedAsset: buildSelectedAsset(focusSymbol, quotes, currency),
    portfolio: buildPortfolio(holdings, quotes, currency),
    watchlist: watchlist.map((w) => w.toUpperCase()),
    alerts:
      alerts.length > 0
        ? {
            total: alerts.length,
            active: activeAlerts,
            triggered: triggeredAlerts,
            items: alerts.slice(0, 20).map((a) => ({
              symbol: a.symbol.toUpperCase(),
              type: ALERT_TYPE_LABELS[a.type] ?? a.type,
              target: a.target,
              status: a.triggeredAt ? "triggered" : a.enabled ? "active" : "disabled",
            })),
          }
        : null,
    marketSnapshot: buildSnapshot(quotes),
  };
}
