import YahooFinanceClass from "yahoo-finance2";
const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
import { unstable_cache } from "next/cache";
import type { MarketDataPoint } from "@/types/market";
import type { AssetUnit } from "@/lib/market";
import type { MarketCategoryId } from "@/types/markets";
import type { ProviderQuote, ProviderCandles, ProviderStats, ProviderFundamentals, QuoteProvider, CandleProvider } from "./types";
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
  // Indici (7)
  SPX:    "^GSPC",
  NDX:    "^NDX",
  DJI:    "^DJI",
  RUT:    "^RUT",
  VIX:    "^VIX",
  DAX:    "^GDAXI",
  FTSE:   "^FTSE",
  N225:   "^N225",

  // Azioni — Mega Cap (24)
  AAPL:   "AAPL",
  MSFT:   "MSFT",
  NVDA:   "NVDA",
  AMZN:   "AMZN",
  GOOGL:  "GOOGL",
  GOOG:   "GOOG",
  META:   "META",
  TSLA:   "TSLA",
  AMD:    "AMD",
  NFLX:   "NFLX",
  INTC:   "INTC",
  AVGO:   "AVGO",
  ORCL:   "ORCL",
  CRM:    "CRM",
  ADBE:   "ADBE",
  CSCO:   "CSCO",
  IBM:    "IBM",
  QCOM:   "QCOM",
  TXN:    "TXN",
  SHOP:   "SHOP",
  UBER:   "UBER",
  PLTR:   "PLTR",

  // Azioni — Financial (10)
  JPM:    "JPM",
  BAC:    "BAC",
  WFC:    "WFC",
  GS:     "GS",
  MS:     "MS",
  C:      "C",
  V:      "V",
  MA:     "MA",
  PYPL:   "PYPL",
  "BRK.B":"BRK-B",

  // Azioni — Consumer/Defensive (13)
  KO:     "KO",
  PEP:    "PEP",
  MCD:    "MCD",
  SBUX:   "SBUX",
  NKE:    "NKE",
  WMT:    "WMT",
  COST:   "COST",
  PG:     "PG",
  JNJ:    "JNJ",
  UNH:    "UNH",
  HD:     "HD",
  LOW:    "LOW",
  DIS:    "DIS",

  // Azioni — Energy/Industrials (9)
  XOM:    "XOM",
  CVX:    "CVX",
  COP:    "COP",
  BA:     "BA",
  CAT:    "CAT",
  GE:     "GE",
  LMT:    "LMT",
  RTX:    "RTX",
  DE:     "DE",

  // ETF (17)
  SPY:    "SPY",
  QQQ:    "QQQ",
  VOO:    "VOO",
  VTI:    "VTI",
  SCHD:   "SCHD",
  AGG:    "AGG",
  BND:    "BND",
  VXUS:   "VXUS",
  VEA:    "VEA",
  VWO:    "VWO",
  IWM:    "IWM",
  DIA:    "DIA",
  XLK:    "XLK",
  XLF:    "XLF",
  XLE:    "XLE",
  XLV:    "XLV",
  XLY:    "XLY",

  // Crypto (12)
  BTCUSD: "BTC-USD",
  ETHUSD: "ETH-USD",
  XRPUSD: "XRP-USD",
  ADAUSD: "ADA-USD",
  SOLUSD: "SOL-USD",
  DOGEUSD:"DOGE-USD",
  AVAXUSD:"AVAX-USD",
  LINKUSD:"LINK-USD",
  DOTUSD: "DOT-USD",
  LTCUSD: "LTC-USD",
  BCHUSD: "BCH-USD",
  UNIUSD: "UNI-USD",

  // Forex (3)
  EURUSD: "EURUSD=X",
  GBPUSD: "GBPUSD=X",
  USDJPY: "USDJPY=X",

  // Commodities (6)
  XAUUSD: "GC=F",
  XAGUSD: "SI=F",
  WTI:    "CL=F",
  BRENT:  "BZ=F",
  NATGAS: "NG=F",
  COPPER: "HG=F",

  // Bond yields (2)
  US10Y:  "^TNX",
  US30Y:  "^TYX",

  // ─── Phase 7A Expansion — NEW ASSETS ─────────────────────────────────────

  // Pharmaceutical & Healthcare
  TMO:    "TMO",
  ABT:    "ABT",
  MRK:    "MRK",
  PFE:    "PFE",
  ABBV:   "ABBV",
  LLY:    "LLY",
  AMGN:   "AMGN",
  GILD:   "GILD",
  ISRG:   "ISRG",
  VRTX:   "VRTX",
  REGN:   "REGN",
  EXPE:   "EXPE",
  SYK:    "SYK",
  THC:    "THC",
  IQV:    "IQV",
  ZTS:    "ZTS",
  AGN:    "AGN",
  CAH:    "CAH",
  HZNP:   "HZNP",
  VTRS:   "VTRS",

  // Semiconductors & Tech Hardware
  AMAT:   "AMAT",
  MU:     "MU",
  LRCX:   "LRCX",
  KLAC:   "KLAC",
  ASML:   "ASML",
  TSM:    "TSM",
  SLAB:   "SLAB",
  MXIM:   "MXIM",
  XLNX:   "XLNX",
  ADVA:   "ADVA",
  BRCM:   "BRCM",
  QRVO:   "QRVO",
  ON:     "ON",
  STM:    "STM",
  NXP:    "NXP",
  AKAM:   "AKAM",

  // Fintech & Payments / Real Estate
  SQ:     "SQ",
  UPST:   "UPST",
  COIN:   "COIN",
  SOFI:   "SOFI",
  AXP:    "AXP",
  DFS:    "DFS",
  MPW:    "MPW",
  PLD:    "PLD",
  DLR:    "DLR",
  PSA:    "PSA",
  AVB:    "AVB",

  // Cloud & Software
  NOW:    "NOW",
  TEAM:   "TEAM",
  DDOG:   "DDOG",
  CRWD:   "CRWD",
  PANW:   "PANW",
  NET:    "NET",
  SNOW:   "SNOW",
  TWLO:   "TWLO",
  MOMO:   "MOMO",
  ZM:     "ZM",
  GTLB:   "GTLB",
  SMAR:   "SMAR",
  WK:     "WK",
  VEEX:   "VEEX",
  VRME:   "VRME",

  // Consumer Discretionary & Retail
  ABNB:   "ABNB",
  MAR:    "MAR",
  CMG:    "CMG",
  TGT:    "TGT",
  CVS:    "CVS",
  ELV:    "ELV",
  TAP:    "TAP",
  ULTA:   "ULTA",
  MHK:    "MHK",
  DHI:    "DHI",
  LEN:    "LEN",
  TOL:    "TOL",
  UAL:    "UAL",
  DAL:    "DAL",
  LUV:    "LUV",

  // Logistics & Transportation
  UPS:    "UPS",
  FDX:    "FDX",
  XPO:    "XPO",
  UNP:    "UNP",
  CSX:    "CSX",
  NSC:    "NSC",
  KNX:    "KNX",
  MATX:   "MATX",
  SOHU:   "SOHU",
  NTES:   "NTES",

  // Manufacturing & Materials
  LIN:    "LIN",
  HON:    "HON",
  JCI:    "JCI",
  DOW:    "DOW",
  DD:     "DD",
  APD:    "APD",
  SHW:    "SHW",
  PPG:    "PPG",
  ECL:    "ECL",
  IFF:    "IFF",
  GGG:    "GGG",
  MLM:    "MLM",
  VMC:    "VMC",
  CEG:    "CEG",

  // Defense & Aerospace
  NOC:    "NOC",
  GD:     "GD",
  ROK:    "ROK",
  EW:     "EW",
  AZO:    "AZO",
  ALK:    "ALK",

  // Consumer Staples
  BFB:    "BF-B",
  KMB:    "KMB",
  HSY:    "HSY",
  TSN:    "TSN",
  GIS:    "GIS",
  MKC:    "MKC",
  STZ:    "STZ",

  // Communications & Telecom
  CMCSA:  "CMCSA",
  TMUS:   "TMUS",
  CHTR:   "CHTR",
  FOX:    "FOX",
  FOXA:   "FOXA",
  WBD:    "WBD",
  LUMN:   "LUMN",
  DISH:   "DISH",

  // Utilities
  NEE:    "NEE",
  DUK:    "DUK",
  SO:     "SO",
  EXC:    "EXC",
  AEP:    "AEP",
  XEL:    "XEL",
  PEG:    "PEG",
  AWK:    "AWK",

  // European Stocks
  SAP:    "SAP",
  SIE:    "SIE",
  BASF:   "BASF",
  BAYN:   "BAYN",
  HEI:    "HEI",
  VOW3:   "VOW3",
  BMW:    "BMW",
  DAI:    "DAI",
  MBG:    "MBG",
  ALV:    "ALV",
  MUV2:   "MUV2",
  OR:     "OR",
  NSRGY:  "NSRGY",
  NVS:    "NVS",
  NOK:    "NOK",
  ERIC:   "ERIC",
  UL:     "UL",
  GSK:    "GSK",
  AZN:    "AZN",

  // Asia-Pacific Stocks
  HDB:    "HDB",
  INFY:   "INFY",
  IBN:    "IBN",
  WIT:    "WIT",
  TCS:    "TCS",
  HMC:    "HMC",
  SNP:    "SNP",
  CHU:    "CHU",
  NAVER:  "NAVER",
  SFTBY:  "SFTBY",
  FAST:   "FAST",
  VROOM:  "VRM",
  DKNG:   "DKNG",
  PENN:   "PENN",

  // Additional ETFs
  ARKK:   "ARKK",
  GLD:    "GLD",
  SLV:    "SLV",
  USO:    "USO",
  DBC:    "DBC",
  GLDM:   "GLDM",
  EEM:    "EEM",
  IEMG:   "IEMG",
  EWJ:    "EWJ",
  EWG:    "EWG",
  EWU:    "EWU",
  EWH:    "EWH",
  IUHY:   "IUHY",
  RSP:    "RSP",
  DGRO:   "DGRO",
  VYM:    "VYM",
  HYG:    "HYG",
  VCIT:   "VCIT",
  LQD:    "LQD",
  VGIT:   "VGIT",
  VCSH:   "VCSH",
  PSP:    "PSP",
  JEPI:   "JEPI",
  VGSLX:  "VGSLX",
  SCHB:   "SCHB",
  SCHA:   "SCHA",
  SCHE:   "SCHE",

  // Additional Crypto (must use DASH format for Yahoo)
  BNBUSD: "BNB-USD",
  MATIUSD:"MATIC-USD",
  FTTUSD: "FIL-USD",
  VETUSD: "VET-USD",
  ATOMUSD:"ATOM-USD",
  MONERO: "XMR-USD",
  ZCASH:  "ZEC-USD",
  THETA:  "THETA-USD",
  IOTA:   "IOTA-USD",
  NEO:    "NEO-USD",
  EOS:    "EOS-USD",
  TRON:   "TRX-USD",
  HEDERA: "HBAR-USD",
  APTOS:  "APT-USD",

  // Additional Commodities
  PALLADIUM:"PA=F",
  PLATINUM: "PL=F",
  ZINC:     "ZN=F",
  ALUMINUM: "ALI=F",
  NICKEL:   "NI=F",
  TIN:      "SN=F",
  CORN:     "ZC=F",
  WHEAT:    "ZW=F",
  SOYBEANS: "ZS=F",
  SUGAR:    "SB=F",

  // Additional Forex
  CHFUSD: "CHFUSD=X",
  AUDUSD: "AUDUSD=X",
  NZDUSD: "NZDUSD=X",
  CADUSD: "CADUSD=X",
  SGDUSD: "SGDUSD=X",
  HKDUSD: "HKDUSD=X",
  INRUSD: "INRUSD=X",
  ZARUSD: "ZARUSD=X",
  BRLUSD: "BRLUSD=X",
  MXNUSD: "MXNUSD=X",
  GBPEUR: "GBPEUR=X",
  EURJPY: "EURJPY=X",
  AUDJPY: "AUDJPY=X",
  NZDJPY: "NZDJPY=X",
  CADJPY: "CADJPY=X",

  // Additional Indices
  IXIC:   "^IXIC",
  DJT:    "^DJT",
  NYA:    "^NYA",
  IXBK:   "^IXBK",
  HUI:    "^HUI",
  XAU:    "^XAU",
  CRY:    "^CRY",
  MOVE:   "^MOVE",

  // Additional Bonds
  US02Y:  "^IRX",
  US05Y:  "^FVX",
  US03M:  "^IRX",
  BUND:   "FGBL=F",
  OAT:    "FGBL=F",
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
  const yahooSymbol = YAHOO_SYMBOL_MAP[catalogSymbol];
  if (!yahooSymbol) return null;
  return _fetchFundamentals(yahooSymbol, DEEP_FETCH_CATEGORIES.has(category));
}
