import YahooFinanceClass from "yahoo-finance2";
const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
import { unstable_cache } from "next/cache";
import type { MarketDataPoint } from "@/types/market";
import type { AssetUnit } from "@/lib/market";
import type { MarketCategoryId } from "@/types/markets";
import type { ProviderQuote, ProviderCandles, ProviderStats, ProviderFundamentals, QuoteProvider, CandleProvider } from "./types";
import { getYahooFreshness } from "./freshnessUtils";
import { MARKET_INSTRUMENTS } from "@/lib/markets/catalog";

/**
 * Yahoo Finance provider (Step 13.2.2): quotazioni + candele daily via
 * `yahoo-finance2` npm package (gestisce automaticamente cookie/crumb auth).
 *
 * - `source`: `"yahoo"`
 * - Caching via `unstable_cache` (Next.js ISR-style) poiché yahoo-finance2
 *   non usa il `fetch` patchato di Next.js.
 * - Quote: `revalidate: 60 s` — dati quasi-realtime per crypto/forex,
 *   ~delayed per equity/ETF/indici durante orario regolare.
 * - Candele: `revalidate: 86400 s` — storico daily aggiornato una volta al giorno.
 * - Nessuna API key richiesta: Yahoo Finance pubblico, accesso gestito dalla lib.
 * - Ritorna `null` se il provider non risponde o il prezzo è zero: mai dati finti.
 */

// ---------------------------------------------------------------------------
// Helper: look up instrument yahooSymbol from catalog
// ---------------------------------------------------------------------------
function getYahooSymbol(catalogSymbol: string): string | undefined {
  return MARKET_INSTRUMENTS.find((i) => i.symbol === catalogSymbol)?.yahooSymbol;
}

// Labels for display (not used for provider routing)
const YAHOO_LABELS: Record<string, string> = {
  SPX:    "S&P 500",
  NDX:    "Nasdaq 100",
  DJI:    "Dow Jones",
  RUT:    "Russell 2000",
  AAPL:   "Apple",
  MSFT:   "Microsoft",
  NVDA:   "NVIDIA",
  AMZN:   "Amazon",
  GOOGL:  "Alphabet",
  META:   "Meta",
  TSLA:   "Tesla",
  AMD:    "AMD",
  PLTR:   "Palantir",
  SPY:    "SPDR S&P 500",
  QQQ:    "Invesco QQQ",
  VOO:    "Vanguard S&P 500",
  VTI:    "Vanguard Total Market",
  SCHD:   "Schwab US Dividend",
  AGG:    "iShares Core Bond",
  BND:    "Vanguard Total Bond",
  BTCUSD: "Bitcoin / USD",
  ETHUSD: "Ethereum / USD",
  XRPUSD: "XRP / USD",
  ADAUSD: "Cardano / USD",
  EURUSD: "EUR / USD",
  GBPUSD: "GBP / USD",
  USDJPY: "USD / JPY",
  XAUUSD: "Oro / USD",
  XAGUSD: "Argento / USD",
  WTI:    "Petrolio WTI",
  NATGAS: "Gas Naturale",
  US10Y:  "Treasury USA 10Y",
  US30Y:  "Treasury USA 30Y",
  // Phase 7A additions
  ASML:   "ASML",
  SAP:    "SAP",
  TSM:    "Taiwan Semi",
  ARKK:   "ARK Innovation",
  BNBUSD: "Binance Coin",
};

/** Simboli la cui unità è "percent" (rendimenti obbligazionari). */
const PERCENT_SYMBOLS = new Set(["US10Y", "US30Y"]);

/** Simboli che tradano 24/7 → freshness "near-live" indipendente da marketState. */
const ALWAYS_OPEN_SYMBOLS = new Set([
  "BTCUSD", "ETHUSD", "XRPUSD", "ADAUSD",
  "EURUSD", "GBPUSD", "USDJPY",
]);

// ---------------------------------------------------------------------------
// Minimal raw-response shapes (cast via unknown to avoid yahoo-finance2
// conditional-type `never` when validateResult is false).
// ---------------------------------------------------------------------------

interface YFQuoteRaw {
  regularMarketPrice?:         number | null;
  regularMarketChange?:        number | null;
  regularMarketChangePercent?: number | null;
  regularMarketTime?:          Date   | number | null;
  regularMarketPreviousClose?: number | null;
  regularMarketOpen?:          number | null;
  regularMarketDayHigh?:       number | null;
  regularMarketDayLow?:        number | null;
  regularMarketVolume?:        number | null;
  averageDailyVolume3Month?:   number | null;
  marketCap?:                  number | null;
  trailingPE?:                 number | null;
  epsTrailingTwelveMonths?:    number | null;
  trailingAnnualDividendYield?:number | null;
  fiftyTwoWeekHigh?:           number | null;
  fiftyTwoWeekLow?:            number | null;
  marketState?:                string | null;
}

interface YFChartQuote {
  date?:     Date   | string | null;
  close?:    number | null;
  adjclose?: number | null;
}

// ---------------------------------------------------------------------------
// Tipi interni serializzabili per unstable_cache
// ---------------------------------------------------------------------------

interface CachedQuoteData {
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
  marketState: string;
  stats: ProviderStats;
}

interface CachedHistoricalPoint {
  date: string;
  close: number;
}

// ---------------------------------------------------------------------------
// Funzioni cached (ISR-style via unstable_cache)
// ---------------------------------------------------------------------------

const _fetchQuote = unstable_cache(
  async (yahooSymbol: string): Promise<CachedQuoteData | null> => {
    try {
      const raw = await yahooFinance.quote(yahooSymbol);
      const q = raw as unknown as YFQuoteRaw;
      if (!q?.regularMarketPrice || q.regularMarketPrice === 0) return null;

      const marketTime = q.regularMarketTime;
      const timestamp =
        marketTime instanceof Date
          ? Math.floor(marketTime.getTime() / 1000)
          : typeof marketTime === "number"
            ? marketTime
            : Math.floor(Date.now() / 1000);

      const stats: ProviderStats = {
        previousClose:    q.regularMarketPreviousClose    ?? undefined,
        open:             q.regularMarketOpen             ?? undefined,
        dayHigh:          q.regularMarketDayHigh          ?? undefined,
        dayLow:           q.regularMarketDayLow           ?? undefined,
        volume:           q.regularMarketVolume           ?? undefined,
        avgVolume:        q.averageDailyVolume3Month       ?? undefined,
        marketCap:        q.marketCap                     ?? undefined,
        pe:               q.trailingPE                    ?? undefined,
        eps:              q.epsTrailingTwelveMonths        ?? undefined,
        dividendYield:    q.trailingAnnualDividendYield != null
                            ? q.trailingAnnualDividendYield * 100
                            : undefined,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh              ?? undefined,
        fiftyTwoWeekLow:  q.fiftyTwoWeekLow               ?? undefined,
      };

      return {
        price:         q.regularMarketPrice,
        change:        q.regularMarketChange        ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
        timestamp,
        marketState:   q.marketState                ?? "CLOSED",
        stats,
      };
    } catch {
      return null;
    }
  },
  ["yahoo-quote"],
  { revalidate: 60 },
);

const _fetchHistorical = unstable_cache(
  async (yahooSymbol: string): Promise<CachedHistoricalPoint[] | null> => {
    try {
      const period2 = new Date().toISOString().slice(0, 10);
      const raw = await yahooFinance.chart(yahooSymbol, {
        period1: "2010-01-01",
        period2,
        interval: "1d",
      });
      const rows = ((raw as unknown as { quotes?: YFChartQuote[] }).quotes) ?? [];
      if (!rows.length) return null;
      return rows
        .filter((r) => ((r.adjclose ?? r.close) ?? 0) > 0)
        .map((r) => ({
          date: r.date instanceof Date
            ? r.date.toISOString().slice(0, 10)
            : String(r.date ?? "").slice(0, 10),
          close: (r.adjclose ?? r.close) as number,
        }));
    } catch {
      return null;
    }
  },
  ["yahoo-historical"],
  { revalidate: 86400 },
);

// ---------------------------------------------------------------------------
// Implementazione provider
// ---------------------------------------------------------------------------

class YahooProvider implements QuoteProvider, CandleProvider {
  readonly source = "yahoo" as const;

  async getQuote(catalogSymbol: string): Promise<ProviderQuote | null> {
    const yahooSymbol = getYahooSymbol(catalogSymbol);
    if (!yahooSymbol) return null;

    const data = await _fetchQuote(yahooSymbol);
    if (!data) return null;

    const unit: AssetUnit = PERCENT_SYMBOLS.has(catalogSymbol) ? "percent" : "index";
    const alwaysOpen = ALWAYS_OPEN_SYMBOLS.has(catalogSymbol);
    const freshness = getYahooFreshness(data.marketState, alwaysOpen);
    const date = new Date(data.timestamp * 1000).toISOString().slice(0, 10);

    return {
      symbol:        catalogSymbol,
      label:         YAHOO_LABELS[catalogSymbol] ?? catalogSymbol,
      unit,
      value:         data.price,
      change:        data.change,
      changePercent: data.changePercent,
      date,
      timestamp:     data.timestamp,
      freshness,
      source:        this.source,
      stats:         data.stats,
    };
  }

  async getCandles(catalogSymbol: string): Promise<ProviderCandles | null> {
    const yahooSymbol = getYahooSymbol(catalogSymbol);
    if (!yahooSymbol) return null;

    const rows = await _fetchHistorical(yahooSymbol);
    if (!rows?.length) return null;

    const points: MarketDataPoint[] = rows.map((r) => ({
      date:  r.date,
      value: r.close,
    }));

    return { symbol: catalogSymbol, points, freshness: "eod", source: this.source };
  }
}

export const yahooProvider: QuoteProvider & CandleProvider = new YahooProvider();

// ---------------------------------------------------------------------------
// Fundamentals — additional quote fields + quoteSummary income statement
// ---------------------------------------------------------------------------

/** Extended quote fields available from Yahoo's quote endpoint beyond basics. */
interface YFQuoteRawFundamentals extends YFQuoteRaw {
  forwardPE?:            number | null;
  beta?:                 number | null;
  priceToBook?:          number | null;
  // ETF-specific
  totalAssets?:          number | null;
  yield?:                number | null;
  fundFamily?:           string | null;
  category?:             string | null;
  // Crypto-specific
  circulatingSupply?:    number | null;
}

interface YFFinancialDataRaw {
  totalRevenue?:         number | null;
  ebitda?:               number | null;
  grossMargins?:         number | null;
  profitMargins?:        number | null;
  operatingMargins?:     number | null;
  returnOnEquity?:       number | null;
  returnOnAssets?:       number | null;
  debtToEquity?:         number | null;
}

interface YFTopHoldingsRaw {
  annualReportExpenseRatio?: number | null;
}

interface YFQuoteSummaryRaw {
  financialData?: YFFinancialDataRaw;
  topHoldings?:   YFTopHoldingsRaw;
}

/** Categories that warrant a full quoteSummary call (income statement available). */
const DEEP_FETCH_CATEGORIES = new Set<MarketCategoryId>(["equity", "etf"]);

/**
 * Fundamentals fetch — cached for 1 hour.
 * Calls Yahoo quote (for valuation/ETF/crypto fields) and optionally
 * quoteSummary (financialData + topHoldings) for equity/ETF income statement data.
 * validateResult:false suppresses Yahoo validation errors on non-standard symbols.
 */
const _fetchFundamentals = unstable_cache(
  async (yahooSymbol: string, deepFetch: boolean): Promise<ProviderFundamentals | null> => {
    try {
      const raw = await yahooFinance.quote(yahooSymbol);
      const q = raw as unknown as YFQuoteRawFundamentals;

      const f: ProviderFundamentals = {
        // Valuation from quote
        trailingPE:      q.trailingPE                    ?? undefined,
        forwardPE:       q.forwardPE                     ?? undefined,
        priceToBook:     q.priceToBook                   ?? undefined,
        beta:            q.beta                          ?? undefined,
        eps:             q.epsTrailingTwelveMonths        ?? undefined,
        dividendYield:   q.trailingAnnualDividendYield != null
                           ? q.trailingAnnualDividendYield * 100
                           : undefined,
        // Market data
        marketCap:       q.marketCap                     ?? undefined,
        avgVolume:       q.averageDailyVolume3Month       ?? undefined,
        fiftyTwoWeekHigh:q.fiftyTwoWeekHigh               ?? undefined,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow                ?? undefined,
        // ETF-specific
        netAssets:       q.totalAssets                   ?? undefined,
        fundYield:       q.yield                         ?? undefined,
        fundFamily:      q.fundFamily                    ?? undefined,
        fundCategory:    q.category                      ?? undefined,
        // Crypto-specific
        circulatingSupply: q.circulatingSupply            ?? undefined,
      };

      if (deepFetch) {
        try {
          const summary = await yahooFinance.quoteSummary(yahooSymbol, {
            modules: ["financialData", "topHoldings"],
            validateResult: false,
          } as Parameters<typeof yahooFinance.quoteSummary>[1]);
          const s = summary as unknown as YFQuoteSummaryRaw;
          const fd = s.financialData;
          if (fd) {
            f.revenue         = fd.totalRevenue      ?? undefined;
            f.ebitda          = fd.ebitda             ?? undefined;
            f.grossMargin     = fd.grossMargins       ?? undefined;
            f.profitMargin    = fd.profitMargins      ?? undefined;
            f.operatingMargin = fd.operatingMargins   ?? undefined;
            f.returnOnEquity  = fd.returnOnEquity     ?? undefined;
            f.returnOnAssets  = fd.returnOnAssets     ?? undefined;
            f.debtToEquity    = fd.debtToEquity       ?? undefined;
          }
          const th = s.topHoldings;
          if (th?.annualReportExpenseRatio != null) {
            f.expenseRatio = th.annualReportExpenseRatio;
          }
        } catch { /* quoteSummary fails for indices/non-US symbols — ignore */ }
      }

      // Return null if nothing populated (symbol not supported)
      const hasData = Object.values(f).some((v) => v != null);
      return hasData ? f : null;
    } catch {
      return null;
    }
  },
  ["yahoo-fundamentals"],
  { revalidate: 3600 },
);

/**
 * Public fundamentals getter.
 * Returns null for forex/commodity/bond (no meaningful fundamentals available).
 */
export async function getAssetFundamentals(
  catalogSymbol: string,
  category: MarketCategoryId,
): Promise<ProviderFundamentals | null> {
  if (category === "forex" || category === "bond" || category === "commodity") return null;
  const yahooSymbol = getYahooSymbol(catalogSymbol);
  if (!yahooSymbol) return null;
  return _fetchFundamentals(yahooSymbol, DEEP_FETCH_CATEGORIES.has(category));
}
