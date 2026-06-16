import YahooFinanceClass from "yahoo-finance2";
const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
import { unstable_cache } from "next/cache";
import type { MarketDataPoint } from "@/types/market";
import type { AssetUnit } from "@/lib/market";
import type { ProviderQuote, ProviderCandles, ProviderStats, QuoteProvider, CandleProvider } from "./types";
import { getYahooFreshness } from "./freshnessUtils";

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
// Mappa simbolo catalogo → simbolo Yahoo Finance
// ---------------------------------------------------------------------------
const YAHOO_SYMBOL_MAP: Record<string, string> = {
  // Indici
  SPX:    "^GSPC",
  NDX:    "^NDX",
  DJI:    "^DJI",
  RUT:    "^RUT",
  // Azioni
  AAPL:   "AAPL",
  MSFT:   "MSFT",
  NVDA:   "NVDA",
  AMZN:   "AMZN",
  GOOGL:  "GOOGL",
  META:   "META",
  TSLA:   "TSLA",
  AMD:    "AMD",
  PLTR:   "PLTR",
  // ETF
  SPY:    "SPY",
  QQQ:    "QQQ",
  VOO:    "VOO",
  VTI:    "VTI",
  SCHD:   "SCHD",
  AGG:    "AGG",
  BND:    "BND",
  // Crypto
  BTCUSD: "BTC-USD",
  ETHUSD: "ETH-USD",
  XRPUSD: "XRP-USD",
  ADAUSD: "ADA-USD",
  // Forex
  EURUSD: "EURUSD=X",
  GBPUSD: "GBPUSD=X",
  USDJPY: "USDJPY=X",
  // Commodities (futures front-month)
  XAUUSD: "GC=F",
  XAGUSD: "SI=F",
  WTI:    "CL=F",
  NATGAS: "NG=F",
  // Bond yields
  US10Y:  "^TNX",
  US30Y:  "^TYX",
};

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
    const yahooSymbol = YAHOO_SYMBOL_MAP[catalogSymbol];
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
    const yahooSymbol = YAHOO_SYMBOL_MAP[catalogSymbol];
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
