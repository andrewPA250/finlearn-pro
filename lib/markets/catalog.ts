import type { MarketCategory, MarketInstrument } from "@/types/markets";
import type { AssetId } from "@/types/market";

/**
 * Categorie mostrate nella pagina Markets, nell'ordine richiesto dal design
 * (Step 10.5). Aggiungere una categoria significa solo estendere questo
 * array: `MarketsView` itera senza assumerne il numero o l'ordine.
 */
export const MARKET_CATEGORIES: MarketCategory[] = [
  { id: "equity", label: "Azioni" },
  { id: "etf", label: "ETF" },
  { id: "index", label: "Indici" },
  { id: "crypto", label: "Crypto" },
  { id: "forex", label: "Forex" },
  { id: "commodity", label: "Commodities" },
  { id: "bond", label: "Bond / Rates" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions for asset creation
// ─────────────────────────────────────────────────────────────────────────────

interface StockOptions {
  symbol: string;
  name: string;
  yahooSymbol: string;
  tradingViewSymbol?: string;
  finnhubSymbol?: string;
}

interface ETFOptions {
  symbol: string;
  name: string;
  yahooSymbol: string;
  tradingViewSymbol?: string;
  finnhubSymbol?: string;
}

interface CryptoOptions {
  symbol: string;
  name: string;
  yahooSymbol: string;
  tradingViewSymbol?: string;
}

interface IndexOptions {
  symbol: string;
  name: string;
  yahooSymbol: string;
  tradingViewSymbol?: string;
  assetId?: AssetId;
}

interface CommodityOptions {
  symbol: string;
  name: string;
  yahooSymbol: string;
  tradingViewSymbol?: string;
  assetId?: AssetId;
}

interface ForexOptions {
  symbol: string;
  name: string;
  yahooSymbol: string;
  tradingViewSymbol?: string;
}

interface BondOptions {
  symbol: string;
  name: string;
  yahooSymbol?: string;
  tradingViewSymbol?: string;
  assetId?: AssetId;
}

function createStock(opts: StockOptions): MarketInstrument {
  return {
    symbol: opts.symbol,
    name: opts.name,
    category: "equity",
    status: "delayed",
    yahooSymbol: opts.yahooSymbol,
    tradingViewSymbol: opts.tradingViewSymbol || `NASDAQ:${opts.symbol}`,
    ...(opts.finnhubSymbol && { finnhubSymbol: opts.finnhubSymbol }),
  };
}

function createETF(opts: ETFOptions): MarketInstrument {
  return {
    symbol: opts.symbol,
    name: opts.name,
    category: "etf",
    status: "delayed",
    yahooSymbol: opts.yahooSymbol,
    tradingViewSymbol: opts.tradingViewSymbol || `AMEX:${opts.symbol}`,
    ...(opts.finnhubSymbol && { finnhubSymbol: opts.finnhubSymbol }),
  };
}

function createCrypto(opts: CryptoOptions): MarketInstrument {
  return {
    symbol: opts.symbol,
    name: opts.name,
    category: "crypto",
    status: "delayed",
    yahooSymbol: opts.yahooSymbol,
    // Default-derives a BINANCE:xxxUSDT symbol, but only when the coin is
    // confirmed listed on Binance — pass tradingViewSymbol: "" explicitly to
    // opt out (e.g. CRO, KAS: verified via Binance's public exchangeInfo API
    // to have no USDT/any-quote pair at all, so the derived symbol would be
    // fabricated and trigger the same "only available on TradingView" popup
    // + fallback bug fixed for indices/bonds/commodities).
    tradingViewSymbol: opts.tradingViewSymbol !== undefined
      ? opts.tradingViewSymbol
      : `BINANCE:${opts.symbol.replace("USD", "USDT")}`,
  };
}

function createIndex(opts: IndexOptions): MarketInstrument {
  return {
    symbol: opts.symbol,
    name: opts.name,
    category: "index",
    status: "delayed",
    yahooSymbol: opts.yahooSymbol,
    tradingViewSymbol: opts.tradingViewSymbol || `TVC:${opts.symbol}`,
    ...(opts.assetId && { assetId: opts.assetId }),
  };
}

function createCommodity(opts: CommodityOptions): MarketInstrument {
  return {
    symbol: opts.symbol,
    name: opts.name,
    category: "commodity",
    status: "delayed",
    yahooSymbol: opts.yahooSymbol,
    tradingViewSymbol: opts.tradingViewSymbol,
    ...(opts.assetId && { assetId: opts.assetId }),
  };
}

function createForex(opts: ForexOptions): MarketInstrument {
  return {
    symbol: opts.symbol,
    name: opts.name,
    category: "forex",
    status: "delayed",
    yahooSymbol: opts.yahooSymbol,
    tradingViewSymbol: opts.tradingViewSymbol || `FX:${opts.symbol}`,
  };
}

function createBond(opts: BondOptions): MarketInstrument {
  return {
    symbol: opts.symbol,
    name: opts.name,
    category: "bond",
    status: opts.yahooSymbol ? "delayed" : "soon",
    ...(opts.yahooSymbol && { yahooSymbol: opts.yahooSymbol }),
    // No fallback: bond tradingViewSymbols vary too much per market
    // (e.g. TVC:US2Y vs TVC:GB10Y) to safely derive from `symbol`. Must be
    // set explicitly; if omitted, tradingViewSymbol is undefined and the
    // Advanced Chart cleanly reports "unavailable" rather than guessing.
    ...(opts.tradingViewSymbol && { tradingViewSymbol: opts.tradingViewSymbol }),
    ...(opts.assetId && { assetId: opts.assetId }),
  };
}

/**
 * Catalogo strumenti del modulo Markets (Step 10.5, esteso in Step 14 v1).
 *
 * Questo array è la **fonte unica** per `/markets`, la Search Overlay e
 * `/asset/[symbol]`: contiene SOLO i metadati anagrafici dello strumento
 * (simbolo, nome, categoria) più campi di disponibilità dati e provider routing.
 *
 * Step 14 v1: Espansione da ~33 a ~100 asset con helper functions per
 * mantenibilità. Tutti gli asset sono supportati da Yahoo Finance come provider
 * primario. TradingView symbols aggiunti dove validati.
 */
export const MARKET_INSTRUMENTS: MarketInstrument[] = [
  // ─── INDICES (7 total) ───────────────────────────────────────────────────
  createIndex({ symbol: "SPX",  name: "S&P 500",                          yahooSymbol: "^GSPC", tradingViewSymbol: "TVC:SPX", assetId: "sp500" }),
  createIndex({ symbol: "NDX",  name: "Nasdaq 100",                       yahooSymbol: "^NDX", tradingViewSymbol: "TVC:NDX" }),
  createIndex({ symbol: "DJI",  name: "Dow Jones Industrial Average",     yahooSymbol: "^DJI", tradingViewSymbol: "TVC:DJI" }),
  createIndex({ symbol: "RUT",  name: "Russell 2000",                     yahooSymbol: "^RUT", tradingViewSymbol: "TVC:RUT" }),
  createIndex({ symbol: "VIX",  name: "CBOE Volatility Index",            yahooSymbol: "^VIX", tradingViewSymbol: "TVC:VIX" }),
  createIndex({ symbol: "DAX",  name: "DAX Performance Index",            yahooSymbol: "^GDAXI", tradingViewSymbol: "XETR:DAX" }),
  createIndex({ symbol: "FTSE", name: "FTSE 100",                         yahooSymbol: "^FTSE", tradingViewSymbol: "TVC:UKX" }),
  createIndex({ symbol: "N225", name: "Nikkei 225",                       yahooSymbol: "^N225", tradingViewSymbol: "TVC:NI225" }),

  // ─── MEGA CAP STOCKS (18 total) ──────────────────────────────────────────
  createStock({ symbol: "AAPL",  name: "Apple Inc.",                       yahooSymbol: "AAPL", finnhubSymbol: "AAPL" }),
  createStock({ symbol: "MSFT",  name: "Microsoft Corp.",                  yahooSymbol: "MSFT", finnhubSymbol: "MSFT" }),
  createStock({ symbol: "NVDA",  name: "NVIDIA Corp.",                     yahooSymbol: "NVDA", finnhubSymbol: "NVDA" }),
  createStock({ symbol: "AMZN",  name: "Amazon.com Inc.",                  yahooSymbol: "AMZN", finnhubSymbol: "AMZN" }),
  createStock({ symbol: "GOOGL", name: "Alphabet Inc. (Classe A)",         yahooSymbol: "GOOGL", finnhubSymbol: "GOOGL" }),
  createStock({ symbol: "GOOG",  name: "Alphabet Inc. (Classe C)",         yahooSymbol: "GOOG", finnhubSymbol: "GOOG" }),
  createStock({ symbol: "META",  name: "Meta Platforms Inc.",              yahooSymbol: "META", finnhubSymbol: "META" }),
  createStock({ symbol: "TSLA",  name: "Tesla Inc.",                       yahooSymbol: "TSLA", finnhubSymbol: "TSLA" }),
  createStock({ symbol: "AMD",   name: "Advanced Micro Devices Inc.",      yahooSymbol: "AMD", finnhubSymbol: "AMD" }),
  createStock({ symbol: "NFLX",  name: "Netflix Inc.",                     yahooSymbol: "NFLX", finnhubSymbol: "NFLX" }),
  createStock({ symbol: "INTC",  name: "Intel Corporation",                yahooSymbol: "INTC", finnhubSymbol: "INTC" }),
  createStock({ symbol: "AVGO",  name: "Broadcom Inc.",                    yahooSymbol: "AVGO", finnhubSymbol: "AVGO" }),
  createStock({ symbol: "ORCL",  name: "Oracle Corporation",               yahooSymbol: "ORCL", finnhubSymbol: "ORCL", tradingViewSymbol: "NYSE:ORCL" }),
  createStock({ symbol: "CRM",   name: "Salesforce Inc.",                  yahooSymbol: "CRM", finnhubSymbol: "CRM", tradingViewSymbol: "NYSE:CRM" }),
  createStock({ symbol: "ADBE",  name: "Adobe Inc.",                       yahooSymbol: "ADBE", finnhubSymbol: "ADBE" }),
  createStock({ symbol: "CSCO",  name: "Cisco Systems Inc.",               yahooSymbol: "CSCO", finnhubSymbol: "CSCO" }),
  createStock({ symbol: "IBM",   name: "International Business Machines",  yahooSymbol: "IBM", finnhubSymbol: "IBM", tradingViewSymbol: "NYSE:IBM" }),
  createStock({ symbol: "QCOM",  name: "Qualcomm Inc.",                    yahooSymbol: "QCOM", finnhubSymbol: "QCOM" }),
  createStock({ symbol: "TXN",   name: "Texas Instruments Inc.",           yahooSymbol: "TXN", finnhubSymbol: "TXN" }),
  createStock({ symbol: "SHOP",  name: "Shopify Inc.",                     yahooSymbol: "SHOP", finnhubSymbol: "SHOP", tradingViewSymbol: "NYSE:SHOP" }),
  createStock({ symbol: "UBER",  name: "Uber Technologies Inc.",           yahooSymbol: "UBER", finnhubSymbol: "UBER", tradingViewSymbol: "NYSE:UBER" }),
  createStock({ symbol: "PLTR",  name: "Palantir Technologies Inc.",       yahooSymbol: "PLTR", tradingViewSymbol: "NYSE:PLTR" }),

  // ─── FINANCIAL STOCKS (10 total) ─────────────────────────────────────────
  createStock({ symbol: "JPM",   name: "JPMorgan Chase & Co.",             yahooSymbol: "JPM", finnhubSymbol: "JPM", tradingViewSymbol: "NYSE:JPM" }),
  createStock({ symbol: "BAC",   name: "Bank of America Corp.",            yahooSymbol: "BAC", finnhubSymbol: "BAC", tradingViewSymbol: "NYSE:BAC" }),
  createStock({ symbol: "WFC",   name: "Wells Fargo & Co.",                yahooSymbol: "WFC", finnhubSymbol: "WFC", tradingViewSymbol: "NYSE:WFC" }),
  createStock({ symbol: "GS",    name: "Goldman Sachs Group Inc.",         yahooSymbol: "GS", finnhubSymbol: "GS", tradingViewSymbol: "NYSE:GS" }),
  createStock({ symbol: "MS",    name: "Morgan Stanley",                   yahooSymbol: "MS", finnhubSymbol: "MS", tradingViewSymbol: "NYSE:MS" }),
  createStock({ symbol: "C",     name: "Citigroup Inc.",                   yahooSymbol: "C", finnhubSymbol: "C", tradingViewSymbol: "NYSE:C" }),
  createStock({ symbol: "V",     name: "Visa Inc.",                        yahooSymbol: "V", finnhubSymbol: "V", tradingViewSymbol: "NYSE:V" }),
  createStock({ symbol: "MA",    name: "Mastercard Inc.",                  yahooSymbol: "MA", finnhubSymbol: "MA", tradingViewSymbol: "NYSE:MA" }),
  createStock({ symbol: "PYPL",  name: "PayPal Holdings Inc.",             yahooSymbol: "PYPL", finnhubSymbol: "PYPL", tradingViewSymbol: "NASDAQ:PYPL" }),
  createStock({ symbol: "BRK.B", name: "Berkshire Hathaway Inc. Class B",  yahooSymbol: "BRK-B", tradingViewSymbol: "NYSE:BRK/B" }),

  // ─── CONSUMER / DEFENSIVE STOCKS (13 total) ──────────────────────────────
  createStock({ symbol: "KO",    name: "Coca-Cola Co.",                    yahooSymbol: "KO", finnhubSymbol: "KO", tradingViewSymbol: "NYSE:KO" }),
  createStock({ symbol: "PEP",   name: "PepsiCo Inc.",                     yahooSymbol: "PEP", finnhubSymbol: "PEP" }),
  createStock({ symbol: "MCD",   name: "McDonald's Corp.",                 yahooSymbol: "MCD", finnhubSymbol: "MCD", tradingViewSymbol: "NYSE:MCD" }),
  createStock({ symbol: "SBUX",  name: "Starbucks Corp.",                  yahooSymbol: "SBUX", finnhubSymbol: "SBUX" }),
  createStock({ symbol: "NKE",   name: "Nike Inc.",                        yahooSymbol: "NKE", finnhubSymbol: "NKE", tradingViewSymbol: "NYSE:NKE" }),
  createStock({ symbol: "WMT",   name: "Walmart Inc.",                     yahooSymbol: "WMT", finnhubSymbol: "WMT", tradingViewSymbol: "NYSE:WMT" }),
  createStock({ symbol: "COST",  name: "Costco Wholesale Corp.",           yahooSymbol: "COST", finnhubSymbol: "COST" }),
  createStock({ symbol: "PG",    name: "Procter & Gamble Co.",             yahooSymbol: "PG", finnhubSymbol: "PG", tradingViewSymbol: "NYSE:PG" }),
  createStock({ symbol: "JNJ",   name: "Johnson & Johnson",                yahooSymbol: "JNJ", finnhubSymbol: "JNJ", tradingViewSymbol: "NYSE:JNJ" }),
  createStock({ symbol: "UNH",   name: "UnitedHealth Group Inc.",          yahooSymbol: "UNH", finnhubSymbol: "UNH", tradingViewSymbol: "NYSE:UNH" }),
  createStock({ symbol: "HD",    name: "Home Depot Inc.",                  yahooSymbol: "HD", finnhubSymbol: "HD", tradingViewSymbol: "NYSE:HD" }),
  createStock({ symbol: "LOW",   name: "Lowe's Companies Inc.",            yahooSymbol: "LOW", finnhubSymbol: "LOW", tradingViewSymbol: "NYSE:LOW" }),
  createStock({ symbol: "DIS",   name: "Walt Disney Co.",                  yahooSymbol: "DIS", finnhubSymbol: "DIS", tradingViewSymbol: "NYSE:DIS" }),

  // ─── ENERGY / INDUSTRIALS (9 total) ──────────────────────────────────────
  createStock({ symbol: "XOM",   name: "Exxon Mobil Corp.",                yahooSymbol: "XOM", finnhubSymbol: "XOM", tradingViewSymbol: "NYSE:XOM" }),
  createStock({ symbol: "CVX",   name: "Chevron Corp.",                    yahooSymbol: "CVX", finnhubSymbol: "CVX", tradingViewSymbol: "NYSE:CVX" }),
  createStock({ symbol: "COP",   name: "ConocoPhillips",                   yahooSymbol: "COP", finnhubSymbol: "COP" }),
  createStock({ symbol: "BA",    name: "Boeing Co.",                       yahooSymbol: "BA", finnhubSymbol: "BA", tradingViewSymbol: "NYSE:BA" }),
  createStock({ symbol: "CAT",   name: "Caterpillar Inc.",                 yahooSymbol: "CAT", finnhubSymbol: "CAT", tradingViewSymbol: "NYSE:CAT" }),
  createStock({ symbol: "GE",    name: "GE Aerospace",                     yahooSymbol: "GE", finnhubSymbol: "GE", tradingViewSymbol: "NYSE:GE" }),
  createStock({ symbol: "LMT",   name: "Lockheed Martin Corp.",            yahooSymbol: "LMT", finnhubSymbol: "LMT", tradingViewSymbol: "NYSE:LMT" }),
  createStock({ symbol: "RTX",   name: "RTX Corporation",                  yahooSymbol: "RTX", finnhubSymbol: "RTX", tradingViewSymbol: "NYSE:RTX" }),
  createStock({ symbol: "DE",    name: "Deere & Co.",                      yahooSymbol: "DE", finnhubSymbol: "DE", tradingViewSymbol: "NYSE:DE" }),

  // ─── ETFs (16 total) ─────────────────────────────────────────────────────
  createETF({ symbol: "SPY",  name: "SPDR S&P 500 ETF",                    yahooSymbol: "SPY", finnhubSymbol: "SPY" }),
  createETF({ symbol: "QQQ",  name: "Invesco QQQ Trust",                   yahooSymbol: "QQQ", finnhubSymbol: "QQQ", tradingViewSymbol: "NASDAQ:QQQ" }),
  createETF({ symbol: "VOO",  name: "Vanguard S&P 500 ETF",                yahooSymbol: "VOO" }),
  createETF({ symbol: "VTI",  name: "Vanguard Total Stock Market ETF",     yahooSymbol: "VTI" }),
  createETF({ symbol: "SCHD", name: "Schwab US Dividend Equity ETF",       yahooSymbol: "SCHD" }),
  createETF({ symbol: "AGG",  name: "iShares Core US Aggregate Bond ETF",  yahooSymbol: "AGG" }),
  createETF({ symbol: "BND",  name: "Vanguard Total Bond Market ETF",      yahooSymbol: "BND" }),
  createETF({ symbol: "VXUS", name: "Vanguard Total International Stock",  yahooSymbol: "VXUS" }),
  createETF({ symbol: "VEA",  name: "Vanguard FTSE Developed Markets ETF", yahooSymbol: "VEA" }),
  createETF({ symbol: "VWO",  name: "Vanguard FTSE Emerging Markets ETF",  yahooSymbol: "VWO" }),
  createETF({ symbol: "IWM",  name: "iShares Russell 2000 ETF",            yahooSymbol: "IWM" }),
  createETF({ symbol: "DIA",  name: "SPDR Dow Jones Industrial Average",   yahooSymbol: "DIA", tradingViewSymbol: "AMEX:DIA" }),
  createETF({ symbol: "XLK",  name: "Technology Select Sector SPDR Fund",  yahooSymbol: "XLK", tradingViewSymbol: "AMEX:XLK" }),
  createETF({ symbol: "XLF",  name: "Financial Select Sector SPDR Fund",   yahooSymbol: "XLF", tradingViewSymbol: "AMEX:XLF" }),
  createETF({ symbol: "XLE",  name: "Energy Select Sector SPDR Fund",      yahooSymbol: "XLE", tradingViewSymbol: "AMEX:XLE" }),
  createETF({ symbol: "XLV",  name: "Health Care Select Sector SPDR Fund", yahooSymbol: "XLV", tradingViewSymbol: "AMEX:XLV" }),
  createETF({ symbol: "XLY",  name: "Consumer Discretionary Select Sector",yahooSymbol: "XLY", tradingViewSymbol: "AMEX:XLY" }),
  createETF({ symbol: "ARKK", name: "ARK Innovation ETF",                  yahooSymbol: "ARKK" }),

  // ─── CRYPTO (10 total) ───────────────────────────────────────────────────
  createCrypto({ symbol: "BTCUSD", name: "Bitcoin",       yahooSymbol: "BTC-USD", tradingViewSymbol: "BINANCE:BTCUSDT" }),
  createCrypto({ symbol: "ETHUSD", name: "Ethereum",      yahooSymbol: "ETH-USD", tradingViewSymbol: "BINANCE:ETHUSDT" }),
  createCrypto({ symbol: "XRPUSD", name: "XRP",           yahooSymbol: "XRP-USD", tradingViewSymbol: "BINANCE:XRPUSDT" }),
  createCrypto({ symbol: "ADAUSD", name: "Cardano",       yahooSymbol: "ADA-USD", tradingViewSymbol: "BINANCE:ADAUSDT" }),
  createCrypto({ symbol: "SOLUSD", name: "Solana",        yahooSymbol: "SOL-USD", tradingViewSymbol: "BINANCE:SOLUSDT" }),
  createCrypto({ symbol: "DOGEUSD", name: "Dogecoin",     yahooSymbol: "DOGE-USD", tradingViewSymbol: "BINANCE:DOGEUSDT" }),
  createCrypto({ symbol: "AVAXUSD", name: "Avalanche",    yahooSymbol: "AVAX-USD", tradingViewSymbol: "BINANCE:AVAXUSDT" }),
  createCrypto({ symbol: "LINKUSD", name: "Chainlink",    yahooSymbol: "LINK-USD", tradingViewSymbol: "BINANCE:LINKUSDT" }),
  createCrypto({ symbol: "DOTUSD", name: "Polkadot",      yahooSymbol: "DOT-USD", tradingViewSymbol: "BINANCE:DOTUSDT" }),
  createCrypto({ symbol: "LTCUSD", name: "Litecoin",      yahooSymbol: "LTC-USD", tradingViewSymbol: "BINANCE:LTCUSDT" }),
  createCrypto({ symbol: "BCHUSD", name: "Bitcoin Cash",  yahooSymbol: "BCH-USD", tradingViewSymbol: "BINANCE:BCHUSDT" }),
  createCrypto({ symbol: "UNIUSD", name: "Uniswap",       yahooSymbol: "UNI-USD", tradingViewSymbol: "BINANCE:UNIUSDT" }),

  // ─── FOREX (3 total) ─────────────────────────────────────────────────────
  createForex({ symbol: "EURUSD", name: "Euro / Dollaro USA",              yahooSymbol: "EURUSD=X", tradingViewSymbol: "FX:EURUSD" }),
  createForex({ symbol: "GBPUSD", name: "Sterlina / Dollaro USA",          yahooSymbol: "GBPUSD=X", tradingViewSymbol: "FX:GBPUSD" }),
  createForex({ symbol: "USDJPY", name: "Dollaro USA / Yen Giapponese",    yahooSymbol: "USDJPY=X", tradingViewSymbol: "FX:USDJPY" }),

  // ─── COMMODITIES (5 total) ───────────────────────────────────────────────
  createCommodity({ symbol: "XAUUSD", name: "Oro",               yahooSymbol: "GC=F", tradingViewSymbol: "TVC:GOLD", assetId: "gold" }),
  createCommodity({ symbol: "XAGUSD", name: "Argento",           yahooSymbol: "SI=F", tradingViewSymbol: "TVC:SILVER" }),
  createCommodity({ symbol: "WTI",    name: "Petrolio WTI",      yahooSymbol: "CL=F", tradingViewSymbol: "TVC:USOIL" }),
  createCommodity({ symbol: "BRENT",  name: "Brent Crude Oil",   yahooSymbol: "BZ=F", tradingViewSymbol: "TVC:UKOIL" }),
  createCommodity({ symbol: "NATGAS", name: "Gas naturale",      yahooSymbol: "NG=F", tradingViewSymbol: "TVC:NATURALGAS" }),
  createCommodity({ symbol: "COPPER", name: "Rame",              yahooSymbol: "HG=F", tradingViewSymbol: "COMEX:HG1!" }),

  // ─── BONDS / RATES (2 total) ────────────────────────────────────────────
  createBond({ symbol: "US10Y", name: "US Treasury 10Y", yahooSymbol: "^TNX", tradingViewSymbol: "TVC:US10Y", assetId: "us10y" }),
  createBond({ symbol: "US30Y", name: "US Treasury 30Y", yahooSymbol: "^TYX", tradingViewSymbol: "TVC:US30Y" }),

  // ─── PHARMACEUTICAL & HEALTHCARE (16 total) ──────────────────────────────
  createStock({ symbol: "TMO",   name: "Thermo Fisher Scientific Inc.",     yahooSymbol: "TMO", finnhubSymbol: "TMO" }),
  createStock({ symbol: "ABT",   name: "Abbott Laboratories",               yahooSymbol: "ABT", finnhubSymbol: "ABT" }),
  createStock({ symbol: "MRK",   name: "Merck & Co. Inc.",                  yahooSymbol: "MRK", finnhubSymbol: "MRK" }),
  createStock({ symbol: "PFE",   name: "Pfizer Inc.",                       yahooSymbol: "PFE", finnhubSymbol: "PFE" }),
  createStock({ symbol: "ABBV",  name: "AbbVie Inc.",                       yahooSymbol: "ABBV", finnhubSymbol: "ABBV" }),
  createStock({ symbol: "LLY",   name: "Eli Lilly and Company",             yahooSymbol: "LLY", finnhubSymbol: "LLY" }),
  createStock({ symbol: "AMGN",  name: "Amgen Inc.",                        yahooSymbol: "AMGN", finnhubSymbol: "AMGN" }),
  createStock({ symbol: "GILD",  name: "Gilead Sciences Inc.",              yahooSymbol: "GILD", finnhubSymbol: "GILD" }),
  createStock({ symbol: "ISRG",  name: "Intuitive Surgical Inc.",           yahooSymbol: "ISRG", finnhubSymbol: "ISRG" }),
  createStock({ symbol: "VRTX",  name: "Vertex Pharmaceuticals Inc.",       yahooSymbol: "VRTX", finnhubSymbol: "VRTX" }),
  createStock({ symbol: "REGN",  name: "Regeneron Pharmaceuticals Inc.",    yahooSymbol: "REGN", finnhubSymbol: "REGN" }),
  createStock({ symbol: "SYK",   name: "Stryker Corporation",               yahooSymbol: "SYK", finnhubSymbol: "SYK" }),
  createStock({ symbol: "THC",   name: "Tenet Healthcare Corporation",      yahooSymbol: "THC", finnhubSymbol: "THC" }),
  createStock({ symbol: "IQV",   name: "IQVIA Holdings Inc.",               yahooSymbol: "IQV", finnhubSymbol: "IQV" }),
  createStock({ symbol: "ZTS",   name: "Zoetis Inc.",                       yahooSymbol: "ZTS", finnhubSymbol: "ZTS" }),
  createStock({ symbol: "CAH",   name: "Cardinal Health Inc.",              yahooSymbol: "CAH", finnhubSymbol: "CAH" }),

  // ─── SEMICONDUCTORS & TECH HARDWARE (11 total) ───────────────────────────
  createStock({ symbol: "AMAT",  name: "Applied Materials Inc.",            yahooSymbol: "AMAT", finnhubSymbol: "AMAT" }),
  createStock({ symbol: "MU",    name: "Micron Technology Inc.",            yahooSymbol: "MU", finnhubSymbol: "MU" }),
  createStock({ symbol: "LRCX",  name: "Lam Research Corporation",          yahooSymbol: "LRCX", finnhubSymbol: "LRCX" }),
  createStock({ symbol: "KLAC",  name: "KLA Corporation",                   yahooSymbol: "KLAC", finnhubSymbol: "KLAC" }),
  createStock({ symbol: "TSM",   name: "Taiwan Semiconductor Mfg Co Ltd",  yahooSymbol: "TSM", finnhubSymbol: "TSM" }),
  createStock({ symbol: "SLAB",  name: "Silicon Laboratories Inc.",         yahooSymbol: "SLAB", finnhubSymbol: "SLAB" }),
  createStock({ symbol: "QRVO",  name: "Qorvo Inc.",                        yahooSymbol: "QRVO", finnhubSymbol: "QRVO" }),
  createStock({ symbol: "ON",    name: "ON Semiconductor Corporation",      yahooSymbol: "ON", finnhubSymbol: "ON" }),
  createStock({ symbol: "STM",   name: "STMicroelectronics N.V.",           yahooSymbol: "STM", finnhubSymbol: "STM" }),
  createStock({ symbol: "NXP",   name: "NXP Semiconductors NV",             yahooSymbol: "NXP", finnhubSymbol: "NXP" }),
  createStock({ symbol: "AKAM",  name: "Akamai Technologies Inc.",          yahooSymbol: "AKAM", finnhubSymbol: "AKAM" }),

  // ─── FINTECH & PAYMENTS (6 total) ─────────────────────────────────────
  createStock({ symbol: "UPST",  name: "Upstart Holdings Inc.",             yahooSymbol: "UPST", finnhubSymbol: "UPST" }),
  createStock({ symbol: "COIN",  name: "Coinbase Global Inc.",              yahooSymbol: "COIN", finnhubSymbol: "COIN" }),
  createStock({ symbol: "SOFI",  name: "SoFi Technologies Inc.",            yahooSymbol: "SOFI", finnhubSymbol: "SOFI" }),
  createStock({ symbol: "AXP",   name: "American Express Company",          yahooSymbol: "AXP", finnhubSymbol: "AXP" }),
  createStock({ symbol: "PLD",   name: "Prologis Inc.",                     yahooSymbol: "PLD", finnhubSymbol: "PLD" }),
  createStock({ symbol: "DLR",   name: "Digital Realty Trust Inc.",         yahooSymbol: "DLR", finnhubSymbol: "DLR" }),

  // ─── CLOUD & SOFTWARE (13 total) ──────────────────────────────────────
  createStock({ symbol: "NOW",   name: "ServiceNow Inc.",                   yahooSymbol: "NOW", finnhubSymbol: "NOW" }),
  createStock({ symbol: "TEAM",  name: "Atlassian Corporation PLC",         yahooSymbol: "TEAM", finnhubSymbol: "TEAM" }),
  createStock({ symbol: "DDOG",  name: "Datadog Inc.",                      yahooSymbol: "DDOG", finnhubSymbol: "DDOG" }),
  createStock({ symbol: "CRWD",  name: "CrowdStrike Holdings Inc.",         yahooSymbol: "CRWD", finnhubSymbol: "CRWD" }),
  createStock({ symbol: "PANW",  name: "Palo Alto Networks Inc.",           yahooSymbol: "PANW", finnhubSymbol: "PANW" }),
  createStock({ symbol: "NET",   name: "Cloudflare Inc.",                   yahooSymbol: "NET", finnhubSymbol: "NET" }),
  createStock({ symbol: "SNOW",  name: "Snowflake Inc.",                    yahooSymbol: "SNOW", finnhubSymbol: "SNOW" }),
  createStock({ symbol: "TWLO",  name: "Twilio Inc.",                       yahooSymbol: "TWLO", finnhubSymbol: "TWLO" }),
  createStock({ symbol: "MOMO",  name: "Momo Inc.",                         yahooSymbol: "MOMO", finnhubSymbol: "MOMO" }),
  createStock({ symbol: "ZM",    name: "Zoom Video Communications Inc.",    yahooSymbol: "ZM", finnhubSymbol: "ZM" }),
  createStock({ symbol: "GTLB",  name: "Gitlab Inc.",                       yahooSymbol: "GTLB", finnhubSymbol: "GTLB" }),
  createStock({ symbol: "WK",    name: "Workiva Inc.",                      yahooSymbol: "WK", finnhubSymbol: "WK" }),
  createStock({ symbol: "VRME",  name: "Vireo Health International Inc.",   yahooSymbol: "VRME", finnhubSymbol: "VRME" }),

  // ─── ASSET UNIVERSE EXPANSION — BATCH 2: equities (91, live-verified via Yahoo) ───
  createStock({ symbol: "ADSK", name: "Autodesk Inc.", yahooSymbol: "ADSK" }),
  createStock({ symbol: "ADM", name: "Archer-Daniels-Midland Co.", yahooSymbol: "ADM" }),
  createStock({ symbol: "AIG", name: "American International Group Inc.", yahooSymbol: "AIG" }),
  createStock({ symbol: "ALGN", name: "Align Technology Inc.", yahooSymbol: "ALGN" }),
  createStock({ symbol: "AMP", name: "Ameriprise Financial Inc.", yahooSymbol: "AMP" }),
  createStock({ symbol: "AVY", name: "Avery Dennison Corp.", yahooSymbol: "AVY" }),
  createStock({ symbol: "BAX", name: "Baxter International Inc.", yahooSymbol: "BAX" }),
  createStock({ symbol: "BEN", name: "Franklin Resources Inc.", yahooSymbol: "BEN" }),
  createStock({ symbol: "BIO", name: "Bio-Rad Laboratories Inc.", yahooSymbol: "BIO" }),
  createStock({ symbol: "BRO", name: "Brown & Brown Inc.", yahooSymbol: "BRO" }),
  createStock({ symbol: "CAG", name: "Conagra Brands Inc.", yahooSymbol: "CAG" }),
  createStock({ symbol: "CARR", name: "Carrier Global Corp.", yahooSymbol: "CARR" }),
  createStock({ symbol: "CBOE", name: "Cboe Global Markets Inc.", yahooSymbol: "CBOE" }),
  createStock({ symbol: "CBRE", name: "CBRE Group Inc.", yahooSymbol: "CBRE" }),
  createStock({ symbol: "CDNS", name: "Cadence Design Systems Inc.", yahooSymbol: "CDNS" }),
  createStock({ symbol: "CDW", name: "CDW Corp.", yahooSymbol: "CDW" }),
  createStock({ symbol: "CHD", name: "Church & Dwight Co. Inc.", yahooSymbol: "CHD" }),
  createStock({ symbol: "CHRW", name: "C.H. Robinson Worldwide Inc.", yahooSymbol: "CHRW" }),
  createStock({ symbol: "CINF", name: "Cincinnati Financial Corp.", yahooSymbol: "CINF" }),
  createStock({ symbol: "CL", name: "Colgate-Palmolive Co.", yahooSymbol: "CL" }),
  createStock({ symbol: "CLX", name: "Clorox Co.", yahooSymbol: "CLX" }),
  createStock({ symbol: "CMS", name: "CMS Energy Corp.", yahooSymbol: "CMS" }),
  createStock({ symbol: "CNP", name: "CenterPoint Energy Inc.", yahooSymbol: "CNP" }),
  createStock({ symbol: "COF", name: "Capital One Financial Corp.", yahooSymbol: "COF" }),
  createStock({ symbol: "CPB", name: "Campbell's Co.", yahooSymbol: "CPB" }),
  createStock({ symbol: "CPT", name: "Camden Property Trust", yahooSymbol: "CPT" }),
  createStock({ symbol: "CSGP", name: "CoStar Group Inc.", yahooSymbol: "CSGP" }),
  createStock({ symbol: "CTSH", name: "Cognizant Technology Solutions Corp.", yahooSymbol: "CTSH" }),
  createStock({ symbol: "CTVA", name: "Corteva Inc.", yahooSymbol: "CTVA" }),
  createStock({ symbol: "D", name: "Dominion Energy Inc.", yahooSymbol: "D" }),
  createStock({ symbol: "DECK", name: "Deckers Brands", yahooSymbol: "DECK" }),
  createStock({ symbol: "DGX", name: "Quest Diagnostics Inc.", yahooSymbol: "DGX" }),
  createStock({ symbol: "DOV", name: "Dover Corp.", yahooSymbol: "DOV" }),
  createStock({ symbol: "DRI", name: "Darden Restaurants Inc.", yahooSymbol: "DRI" }),
  createStock({ symbol: "DTE", name: "DTE Energy Co.", yahooSymbol: "DTE" }),
  createStock({ symbol: "DVA", name: "DaVita Inc.", yahooSymbol: "DVA" }),
  createStock({ symbol: "EBAY", name: "eBay Inc.", yahooSymbol: "EBAY" }),
  createStock({ symbol: "ED", name: "Consolidated Edison Inc.", yahooSymbol: "ED" }),
  createStock({ symbol: "EFX", name: "Equifax Inc.", yahooSymbol: "EFX" }),
  createStock({ symbol: "EIX", name: "Edison International", yahooSymbol: "EIX" }),
  createStock({ symbol: "ENPH", name: "Enphase Energy Inc.", yahooSymbol: "ENPH" }),
  createStock({ symbol: "EPAM", name: "EPAM Systems Inc.", yahooSymbol: "EPAM" }),
  createStock({ symbol: "ETR", name: "Entergy Corp.", yahooSymbol: "ETR" }),
  createStock({ symbol: "ETSY", name: "Etsy Inc.", yahooSymbol: "ETSY" }),
  createStock({ symbol: "EXPD", name: "Expeditors International of Washington Inc.", yahooSymbol: "EXPD" }),
  createStock({ symbol: "EXR", name: "Extra Space Storage Inc.", yahooSymbol: "EXR" }),
  createStock({ symbol: "FE", name: "FirstEnergy Corp.", yahooSymbol: "FE" }),
  createStock({ symbol: "FFIV", name: "F5 Inc.", yahooSymbol: "FFIV" }),
  createStock({ symbol: "FITB", name: "Fifth Third Bancorp", yahooSymbol: "FITB" }),
  createStock({ symbol: "FRT", name: "Federal Realty Investment Trust", yahooSymbol: "FRT" }),
  createStock({ symbol: "FSLR", name: "First Solar Inc.", yahooSymbol: "FSLR" }),
  createStock({ symbol: "GL", name: "Globe Life Inc.", yahooSymbol: "GL" }),
  createStock({ symbol: "GLW", name: "Corning Inc.", yahooSymbol: "GLW" }),
  createStock({ symbol: "GPC", name: "Genuine Parts Co.", yahooSymbol: "GPC" }),
  createStock({ symbol: "HAS", name: "Hasbro Inc.", yahooSymbol: "HAS" }),
  createStock({ symbol: "HBAN", name: "Huntington Bancshares Inc.", yahooSymbol: "HBAN" }),
  createStock({ symbol: "HIG", name: "Hartford Financial Services Group Inc.", yahooSymbol: "HIG" }),
  createStock({ symbol: "HPE", name: "Hewlett Packard Enterprise Co.", yahooSymbol: "HPE" }),
  createStock({ symbol: "HRL", name: "Hormel Foods Corp.", yahooSymbol: "HRL" }),
  createStock({ symbol: "HSIC", name: "Henry Schein Inc.", yahooSymbol: "HSIC" }),
  createStock({ symbol: "HST", name: "Host Hotels & Resorts Inc.", yahooSymbol: "HST" }),
  createStock({ symbol: "HWM", name: "Howmet Aerospace Inc.", yahooSymbol: "HWM" }),
  createStock({ symbol: "INCY", name: "Incyte Corp.", yahooSymbol: "INCY" }),
  createStock({ symbol: "INVH", name: "Invitation Homes Inc.", yahooSymbol: "INVH" }),
  createStock({ symbol: "IRM", name: "Iron Mountain Inc.", yahooSymbol: "IRM" }),
  createStock({ symbol: "IT", name: "Gartner Inc.", yahooSymbol: "IT" }),
  createStock({ symbol: "IVZ", name: "Invesco Ltd.", yahooSymbol: "IVZ" }),
  createStock({ symbol: "J", name: "Jacobs Solutions Inc.", yahooSymbol: "J" }),
  createStock({ symbol: "JBHT", name: "J.B. Hunt Transport Services Inc.", yahooSymbol: "JBHT" }),
  createStock({ symbol: "JBL", name: "Jabil Inc.", yahooSymbol: "JBL" }),
  createStock({ symbol: "JKHY", name: "Jack Henry & Associates Inc.", yahooSymbol: "JKHY" }),
  createStock({ symbol: "KEY", name: "KeyCorp", yahooSymbol: "KEY" }),
  createStock({ symbol: "KEYS", name: "Keysight Technologies Inc.", yahooSymbol: "KEYS" }),
  createStock({ symbol: "KHC", name: "Kraft Heinz Co.", yahooSymbol: "KHC" }),
  createStock({ symbol: "KIM", name: "Kimco Realty Corp.", yahooSymbol: "KIM" }),
  createStock({ symbol: "KMX", name: "CarMax Inc.", yahooSymbol: "KMX" }),
  createStock({ symbol: "KVUE", name: "Kenvue Inc.", yahooSymbol: "KVUE" }),
  createStock({ symbol: "L", name: "Loews Corp.", yahooSymbol: "L" }),
  createStock({ symbol: "LH", name: "Labcorp Holdings Inc.", yahooSymbol: "LH" }),
  createStock({ symbol: "LKQ", name: "LKQ Corp.", yahooSymbol: "LKQ" }),
  createStock({ symbol: "LNT", name: "Alliant Energy Corp.", yahooSymbol: "LNT" }),
  createStock({ symbol: "LVS", name: "Las Vegas Sands Corp.", yahooSymbol: "LVS" }),
  createStock({ symbol: "LW", name: "Lamb Weston Holdings Inc.", yahooSymbol: "LW" }),
  createStock({ symbol: "LYB", name: "LyondellBasell Industries NV", yahooSymbol: "LYB" }),
  createStock({ symbol: "MAA", name: "Mid-America Apartment Communities Inc.", yahooSymbol: "MAA" }),
  createStock({ symbol: "MAS", name: "Masco Corp.", yahooSymbol: "MAS" }),
  createStock({ symbol: "MGM", name: "MGM Resorts International", yahooSymbol: "MGM" }),
  createStock({ symbol: "MKTX", name: "MarketAxess Holdings Inc.", yahooSymbol: "MKTX" }),
  createStock({ symbol: "MNST", name: "Monster Beverage Corp.", yahooSymbol: "MNST" }),
  createStock({ symbol: "MOS", name: "Mosaic Co.", yahooSymbol: "MOS" }),
  createStock({ symbol: "MPWR", name: "Monolithic Power Systems Inc.", yahooSymbol: "MPWR" }),

  // ─── ASSET UNIVERSE EXPANSION — BATCH 3: equities (80, live-verified via Yahoo) ───
  createStock({ symbol: "MSI", name: "Motorola Solutions Inc.", yahooSymbol: "MSI" }),
  createStock({ symbol: "MTB", name: "M&T Bank Corp.", yahooSymbol: "MTB" }),
  createStock({ symbol: "MTCH", name: "Match Group Inc.", yahooSymbol: "MTCH" }),
  createStock({ symbol: "NDSN", name: "Nordson Corp.", yahooSymbol: "NDSN" }),
  createStock({ symbol: "NEM", name: "Newmont Corp.", yahooSymbol: "NEM" }),
  createStock({ symbol: "NI", name: "NiSource Inc.", yahooSymbol: "NI" }),
  createStock({ symbol: "NTRS", name: "Northern Trust Corp.", yahooSymbol: "NTRS" }),
  createStock({ symbol: "NVR", name: "NVR Inc.", yahooSymbol: "NVR" }),
  createStock({ symbol: "NWS", name: "News Corp Class B", yahooSymbol: "NWS" }),
  createStock({ symbol: "NWSA", name: "News Corp Class A", yahooSymbol: "NWSA" }),
  createStock({ symbol: "ODFL", name: "Old Dominion Freight Line Inc.", yahooSymbol: "ODFL" }),
  createStock({ symbol: "OMC", name: "Omnicom Group Inc.", yahooSymbol: "OMC" }),
  createStock({ symbol: "ORLY", name: "O'Reilly Automotive Inc.", yahooSymbol: "ORLY" }),
  createStock({ symbol: "OTIS", name: "Otis Worldwide Corp.", yahooSymbol: "OTIS" }),
  createStock({ symbol: "PAYC", name: "Paycom Software Inc.", yahooSymbol: "PAYC" }),
  createStock({ symbol: "PCG", name: "PG&E Corp.", yahooSymbol: "PCG" }),
  createStock({ symbol: "PFG", name: "Principal Financial Group Inc.", yahooSymbol: "PFG" }),
  createStock({ symbol: "PHM", name: "PulteGroup Inc.", yahooSymbol: "PHM" }),
  createStock({ symbol: "PNC", name: "PNC Financial Services Group Inc.", yahooSymbol: "PNC" }),
  createStock({ symbol: "PNR", name: "Pentair plc", yahooSymbol: "PNR" }),
  createStock({ symbol: "PNW", name: "Pinnacle West Capital Corp.", yahooSymbol: "PNW" }),
  createStock({ symbol: "PTC", name: "PTC Inc.", yahooSymbol: "PTC" }),
  createStock({ symbol: "PWR", name: "Quanta Services Inc.", yahooSymbol: "PWR" }),
  createStock({ symbol: "QGEN", name: "Qiagen NV", yahooSymbol: "QGEN" }),
  createStock({ symbol: "REG", name: "Regency Centers Corp.", yahooSymbol: "REG" }),
  createStock({ symbol: "RF", name: "Regions Financial Corp.", yahooSymbol: "RF" }),
  createStock({ symbol: "RHI", name: "Robert Half Inc.", yahooSymbol: "RHI" }),
  createStock({ symbol: "RJF", name: "Raymond James Financial Inc.", yahooSymbol: "RJF" }),
  createStock({ symbol: "RL", name: "Ralph Lauren Corp.", yahooSymbol: "RL" }),
  createStock({ symbol: "ROL", name: "Rollins Inc.", yahooSymbol: "ROL" }),
  createStock({ symbol: "ROP", name: "Roper Technologies Inc.", yahooSymbol: "ROP" }),
  createStock({ symbol: "RVTY", name: "Revvity Inc.", yahooSymbol: "RVTY" }),
  createStock({ symbol: "SBAC", name: "SBA Communications Corp.", yahooSymbol: "SBAC" }),
  createStock({ symbol: "SCHW", name: "Charles Schwab Corp.", yahooSymbol: "SCHW" }),
  createStock({ symbol: "SJM", name: "J.M. Smucker Co.", yahooSymbol: "SJM" }),
  createStock({ symbol: "SLG", name: "SL Green Realty Corp.", yahooSymbol: "SLG" }),
  createStock({ symbol: "SMR", name: "NuScale Power Corp.", yahooSymbol: "SMR" }),
  createStock({ symbol: "SNA", name: "Snap-on Inc.", yahooSymbol: "SNA" }),
  createStock({ symbol: "SNPS", name: "Synopsys Inc.", yahooSymbol: "SNPS" }),
  createStock({ symbol: "SRE", name: "Sempra", yahooSymbol: "SRE" }),
  createStock({ symbol: "STE", name: "Steris plc", yahooSymbol: "STE" }),
  createStock({ symbol: "STX", name: "Seagate Technology Holdings plc", yahooSymbol: "STX" }),
  createStock({ symbol: "SWK", name: "Stanley Black & Decker Inc.", yahooSymbol: "SWK" }),
  createStock({ symbol: "SWKS", name: "Skyworks Solutions Inc.", yahooSymbol: "SWKS" }),
  createStock({ symbol: "SYF", name: "Synchrony Financial", yahooSymbol: "SYF" }),
  createStock({ symbol: "T", name: "AT&T Inc.", yahooSymbol: "T" }),
  createStock({ symbol: "TDY", name: "Teledyne Technologies Inc.", yahooSymbol: "TDY" }),
  createStock({ symbol: "TECH", name: "Bio-Techne Corp.", yahooSymbol: "TECH" }),
  createStock({ symbol: "TER", name: "Teradyne Inc.", yahooSymbol: "TER" }),
  createStock({ symbol: "TFC", name: "Truist Financial Corp.", yahooSymbol: "TFC" }),
  createStock({ symbol: "TFX", name: "Teleflex Inc.", yahooSymbol: "TFX" }),
  createStock({ symbol: "TPR", name: "Tapestry Inc.", yahooSymbol: "TPR" }),
  createStock({ symbol: "TRGP", name: "Targa Resources Corp.", yahooSymbol: "TRGP" }),
  createStock({ symbol: "TRMB", name: "Trimble Inc.", yahooSymbol: "TRMB" }),
  createStock({ symbol: "TROW", name: "T. Rowe Price Group Inc.", yahooSymbol: "TROW" }),
  createStock({ symbol: "TRV", name: "Travelers Companies Inc.", yahooSymbol: "TRV" }),
  createStock({ symbol: "TXT", name: "Textron Inc.", yahooSymbol: "TXT" }),
  createStock({ symbol: "TYL", name: "Tyler Technologies Inc.", yahooSymbol: "TYL" }),
  createStock({ symbol: "UDR", name: "UDR Inc.", yahooSymbol: "UDR" }),
  createStock({ symbol: "UHS", name: "Universal Health Services Inc.", yahooSymbol: "UHS" }),
  createStock({ symbol: "USB", name: "U.S. Bancorp", yahooSymbol: "USB" }),
  createStock({ symbol: "VFC", name: "V.F. Corp.", yahooSymbol: "VFC" }),
  createStock({ symbol: "VICI", name: "VICI Properties Inc.", yahooSymbol: "VICI" }),
  createStock({ symbol: "VRSN", name: "VeriSign Inc.", yahooSymbol: "VRSN" }),
  createStock({ symbol: "VTR", name: "Ventas Inc.", yahooSymbol: "VTR" }),
  createStock({ symbol: "VTRS", name: "Viatris Inc.", yahooSymbol: "VTRS" }),
  createStock({ symbol: "VZ", name: "Verizon Communications Inc.", yahooSymbol: "VZ" }),
  createStock({ symbol: "WAB", name: "Wabtec Corp.", yahooSymbol: "WAB" }),
  createStock({ symbol: "WAT", name: "Waters Corp.", yahooSymbol: "WAT" }),
  createStock({ symbol: "WDC", name: "Western Digital Corp.", yahooSymbol: "WDC" }),
  createStock({ symbol: "WEC", name: "WEC Energy Group Inc.", yahooSymbol: "WEC" }),
  createStock({ symbol: "WHR", name: "Whirlpool Corp.", yahooSymbol: "WHR" }),
  createStock({ symbol: "WRB", name: "W.R. Berkley Corp.", yahooSymbol: "WRB" }),
  createStock({ symbol: "WST", name: "West Pharmaceutical Services Inc.", yahooSymbol: "WST" }),
  createStock({ symbol: "WTW", name: "Willis Towers Watson plc", yahooSymbol: "WTW" }),
  createStock({ symbol: "WY", name: "Weyerhaeuser Co.", yahooSymbol: "WY" }),
  createStock({ symbol: "WYNN", name: "Wynn Resorts Ltd.", yahooSymbol: "WYNN" }),
  createStock({ symbol: "XYL", name: "Xylem Inc.", yahooSymbol: "XYL" }),
  createStock({ symbol: "ZBRA", name: "Zebra Technologies Corp.", yahooSymbol: "ZBRA" }),
  createStock({ symbol: "ZION", name: "Zions Bancorporation", yahooSymbol: "ZION" }),

  // ─── ASSET UNIVERSE EXPANSION — BATCH 5: equities (58, live-verified via Yahoo) ───
  createStock({ symbol: "DXC", name: "DXC Technology Co.", yahooSymbol: "DXC" }),
  createStock({ symbol: "WDAY", name: "Workday Inc.", yahooSymbol: "WDAY" }),
  createStock({ symbol: "VEEV", name: "Veeva Systems Inc.", yahooSymbol: "VEEV" }),
  createStock({ symbol: "DOCN", name: "DigitalOcean Holdings Inc.", yahooSymbol: "DOCN" }),
  createStock({ symbol: "PCTY", name: "Paylocity Holding Corp.", yahooSymbol: "PCTY" }),
  createStock({ symbol: "BILL", name: "Bill.com Holdings Inc.", yahooSymbol: "BILL" }),
  createStock({ symbol: "APPF", name: "AppFolio Inc.", yahooSymbol: "APPF" }),
  createStock({ symbol: "PEGA", name: "Pegasystems Inc.", yahooSymbol: "PEGA" }),
  createStock({ symbol: "MANH", name: "Manhattan Associates Inc.", yahooSymbol: "MANH" }),
  createStock({ symbol: "ALRM", name: "Alarm.com Holdings Inc.", yahooSymbol: "ALRM" }),
  createStock({ symbol: "SPSC", name: "SPS Commerce Inc.", yahooSymbol: "SPSC" }),
  createStock({ symbol: "SSNC", name: "SS&C Technologies Holdings Inc.", yahooSymbol: "SSNC" }),
  createStock({ symbol: "BLKB", name: "Blackbaud Inc.", yahooSymbol: "BLKB" }),
  createStock({ symbol: "QLYS", name: "Qualys Inc.", yahooSymbol: "QLYS" }),
  createStock({ symbol: "RPD", name: "Rapid7 Inc.", yahooSymbol: "RPD" }),
  createStock({ symbol: "TENB", name: "Tenable Holdings Inc.", yahooSymbol: "TENB" }),
  createStock({ symbol: "VRNS", name: "Varonis Systems Inc.", yahooSymbol: "VRNS" }),
  createStock({ symbol: "FROG", name: "JFrog Ltd.", yahooSymbol: "FROG" }),
  createStock({ symbol: "PD", name: "PagerDuty Inc.", yahooSymbol: "PD" }),
  createStock({ symbol: "ASAN", name: "Asana Inc.", yahooSymbol: "ASAN" }),
  createStock({ symbol: "BOX", name: "Box Inc.", yahooSymbol: "BOX" }),
  createStock({ symbol: "DBX", name: "Dropbox Inc.", yahooSymbol: "DBX" }),
  createStock({ symbol: "DOMO", name: "Domo Inc.", yahooSymbol: "DOMO" }),
  createStock({ symbol: "YEXT", name: "Yext Inc.", yahooSymbol: "YEXT" }),
  createStock({ symbol: "WIX", name: "Wix.com Ltd.", yahooSymbol: "WIX" }),
  createStock({ symbol: "APPN", name: "Appian Corp.", yahooSymbol: "APPN" }),
  createStock({ symbol: "NCNO", name: "nCino Inc.", yahooSymbol: "NCNO" }),
  createStock({ symbol: "FSLY", name: "Fastly Inc.", yahooSymbol: "FSLY" }),
  createStock({ symbol: "GTLS", name: "Chart Industries Inc.", yahooSymbol: "GTLS" }),
  createStock({ symbol: "FIX", name: "Comfort Systems USA Inc.", yahooSymbol: "FIX" }),
  createStock({ symbol: "ACM", name: "AECOM", yahooSymbol: "ACM" }),
  createStock({ symbol: "MTZ", name: "MasTec Inc.", yahooSymbol: "MTZ" }),
  createStock({ symbol: "EME", name: "EMCOR Group Inc.", yahooSymbol: "EME" }),
  createStock({ symbol: "DY", name: "Dycom Industries Inc.", yahooSymbol: "DY" }),
  createStock({ symbol: "PRIM", name: "Primoris Services Corp.", yahooSymbol: "PRIM" }),
  createStock({ symbol: "AOS", name: "A. O. Smith Corp.", yahooSymbol: "AOS" }),
  createStock({ symbol: "LII", name: "Lennox International Inc.", yahooSymbol: "LII" }),
  createStock({ symbol: "ALLE", name: "Allegion plc", yahooSymbol: "ALLE" }),
  createStock({ symbol: "CSL", name: "Carlisle Companies Inc.", yahooSymbol: "CSL" }),
  createStock({ symbol: "IEX", name: "IDEX Corp.", yahooSymbol: "IEX" }),
  createStock({ symbol: "WTS", name: "Watts Water Technologies Inc.", yahooSymbol: "WTS" }),
  createStock({ symbol: "ITT", name: "ITT Inc.", yahooSymbol: "ITT" }),
  createStock({ symbol: "XPEL", name: "XPEL Inc.", yahooSymbol: "XPEL" }),
  createStock({ symbol: "THO", name: "Thor Industries Inc.", yahooSymbol: "THO" }),
  createStock({ symbol: "WGO", name: "Winnebago Industries Inc.", yahooSymbol: "WGO" }),
  createStock({ symbol: "PII", name: "Polaris Inc.", yahooSymbol: "PII" }),
  createStock({ symbol: "HOG", name: "Harley-Davidson Inc.", yahooSymbol: "HOG" }),
  createStock({ symbol: "BC", name: "Brunswick Corp.", yahooSymbol: "BC" }),
  createStock({ symbol: "SNBR", name: "Sleep Number Corp.", yahooSymbol: "SNBR" }),
  createStock({ symbol: "LEG", name: "Leggett & Platt Inc.", yahooSymbol: "LEG" }),
  createStock({ symbol: "PLAY", name: "Dave & Buster's Entertainment Inc.", yahooSymbol: "PLAY" }),
  createStock({ symbol: "BYD", name: "Boyd Gaming Corp.", yahooSymbol: "BYD" }),
  createStock({ symbol: "CHDN", name: "Churchill Downs Inc.", yahooSymbol: "CHDN" }),
  createStock({ symbol: "RSI", name: "Rush Street Interactive Inc.", yahooSymbol: "RSI" }),
  createStock({ symbol: "GENI", name: "Genius Sports Ltd.", yahooSymbol: "GENI" }),
  createStock({ symbol: "CZR", name: "Caesars Entertainment Inc.", yahooSymbol: "CZR" }),
  createStock({ symbol: "RRR", name: "Red Rock Resorts Inc.", yahooSymbol: "RRR" }),
  createStock({ symbol: "MCRI", name: "Monarch Casino & Resort Inc.", yahooSymbol: "MCRI" }),

  // ─── CONSUMER DISCRETIONARY & RETAIL (15 total) ──────────────────────────
  createStock({ symbol: "ABNB",  name: "Airbnb Inc.",                       yahooSymbol: "ABNB", finnhubSymbol: "ABNB" }),
  createStock({ symbol: "MAR",   name: "Marriott International Inc.",       yahooSymbol: "MAR", finnhubSymbol: "MAR" }),
  createStock({ symbol: "CMG",   name: "Chipotle Mexican Grill Inc.",       yahooSymbol: "CMG", finnhubSymbol: "CMG" }),
  createStock({ symbol: "TGT",   name: "Target Corporation",                yahooSymbol: "TGT", finnhubSymbol: "TGT" }),
  createStock({ symbol: "CVS",   name: "CVS Health Corporation",            yahooSymbol: "CVS", finnhubSymbol: "CVS" }),
  createStock({ symbol: "ELV",   name: "Elevance Health Inc.",              yahooSymbol: "ELV", finnhubSymbol: "ELV" }),
  createStock({ symbol: "TAP",   name: "Molson Coors Brewing Company",      yahooSymbol: "TAP", finnhubSymbol: "TAP" }),
  createStock({ symbol: "ULTA",  name: "Ulta Beauty Inc.",                  yahooSymbol: "ULTA", finnhubSymbol: "ULTA" }),
  createStock({ symbol: "MHK",   name: "Mohawk Industries Inc.",            yahooSymbol: "MHK", finnhubSymbol: "MHK" }),
  createStock({ symbol: "DHI",   name: "D.R. Horton Inc.",                  yahooSymbol: "DHI", finnhubSymbol: "DHI" }),
  createStock({ symbol: "LEN",   name: "Lennar Corporation",                yahooSymbol: "LEN", finnhubSymbol: "LEN" }),
  createStock({ symbol: "TOL",   name: "Toll Brothers Inc.",                yahooSymbol: "TOL", finnhubSymbol: "TOL" }),
  createStock({ symbol: "UAL",   name: "United Airlines Holdings Inc.",     yahooSymbol: "UAL", finnhubSymbol: "UAL" }),
  createStock({ symbol: "DAL",   name: "Delta Air Lines Inc.",              yahooSymbol: "DAL", finnhubSymbol: "DAL" }),
  createStock({ symbol: "LUV",   name: "Southwest Airlines Co.",            yahooSymbol: "LUV", finnhubSymbol: "LUV" }),

  // ─── LOGISTICS & TRANSPORTATION (10 total) ──────────────────────────────
  createStock({ symbol: "UPS",   name: "United Parcel Service Inc.",        yahooSymbol: "UPS", finnhubSymbol: "UPS" }),
  createStock({ symbol: "FDX",   name: "FedEx Corporation",                 yahooSymbol: "FDX", finnhubSymbol: "FDX" }),
  createStock({ symbol: "XPO",   name: "XPO Inc.",                          yahooSymbol: "XPO", finnhubSymbol: "XPO" }),
  createStock({ symbol: "UNP",   name: "Union Pacific Corporation",         yahooSymbol: "UNP", finnhubSymbol: "UNP" }),
  createStock({ symbol: "CSX",   name: "CSX Corporation",                   yahooSymbol: "CSX", finnhubSymbol: "CSX" }),
  createStock({ symbol: "NSC",   name: "Norfolk Southern Railway Company",  yahooSymbol: "NSC", finnhubSymbol: "NSC" }),
  createStock({ symbol: "KNX",   name: "Knot Offshore Partners LP",         yahooSymbol: "KNX", finnhubSymbol: "KNX" }),
  createStock({ symbol: "MATX",  name: "Mattel Inc.",                       yahooSymbol: "MATX", finnhubSymbol: "MATX" }),
  createStock({ symbol: "SOHU",  name: "Sohu.com Inc.",                     yahooSymbol: "SOHU", finnhubSymbol: "SOHU" }),
  createStock({ symbol: "NTES",  name: "NetEase Inc.",                      yahooSymbol: "NTES", finnhubSymbol: "NTES" }),

  // ─── MANUFACTURING & MATERIALS (13 total) ────────────────────────────────
  createStock({ symbol: "LIN",   name: "Linde PLC",                         yahooSymbol: "LIN", finnhubSymbol: "LIN" }),
  createStock({ symbol: "HON",   name: "Honeywell International Inc.",      yahooSymbol: "HON", finnhubSymbol: "HON" }),
  createStock({ symbol: "JCI",   name: "Johnson Controls International PLC", yahooSymbol: "JCI", finnhubSymbol: "JCI" }),
  createStock({ symbol: "DOW",   name: "Dow Inc.",                          yahooSymbol: "DOW", finnhubSymbol: "DOW" }),
  createStock({ symbol: "DD",    name: "DuPont de Nemours Inc.",            yahooSymbol: "DD", finnhubSymbol: "DD" }),
  createStock({ symbol: "APD",   name: "Air Products and Chemicals Inc.",   yahooSymbol: "APD", finnhubSymbol: "APD" }),
  createStock({ symbol: "SHW",   name: "Sherwin-Williams Company",          yahooSymbol: "SHW", finnhubSymbol: "SHW" }),
  createStock({ symbol: "PPG",   name: "PPG Industries Inc.",               yahooSymbol: "PPG", finnhubSymbol: "PPG" }),
  createStock({ symbol: "ECL",   name: "Ecolab Inc.",                       yahooSymbol: "ECL", finnhubSymbol: "ECL" }),
  createStock({ symbol: "IFF",   name: "International Flavors & Fragrances",yahooSymbol: "IFF", finnhubSymbol: "IFF" }),
  createStock({ symbol: "GGG",   name: "Graco Inc.",                        yahooSymbol: "GGG", finnhubSymbol: "GGG" }),
  createStock({ symbol: "MLM",   name: "Martin Marietta Materials Inc.",    yahooSymbol: "MLM", finnhubSymbol: "MLM" }),
  createStock({ symbol: "VMC",   name: "Vulcan Materials Company",          yahooSymbol: "VMC", finnhubSymbol: "VMC" }),

  // ─── DEFENSE & AEROSPACE (6 total) ──────────────────────────────────────
  createStock({ symbol: "NOC",   name: "Northrop Grumman Corporation",      yahooSymbol: "NOC", finnhubSymbol: "NOC" }),
  createStock({ symbol: "GD",    name: "General Dynamics Corporation",      yahooSymbol: "GD", finnhubSymbol: "GD" }),
  createStock({ symbol: "ROK",   name: "Rockwell Automation Inc.",          yahooSymbol: "ROK", finnhubSymbol: "ROK" }),
  createStock({ symbol: "EW",    name: "Edwards Lifesciences Corp.",        yahooSymbol: "EW", finnhubSymbol: "EW" }),
  createStock({ symbol: "AZO",   name: "AutoZone Inc.",                     yahooSymbol: "AZO", finnhubSymbol: "AZO" }),
  createStock({ symbol: "ALK",   name: "Alaska Air Group Inc.",             yahooSymbol: "ALK", finnhubSymbol: "ALK" }),

  // ─── CONSUMER STAPLES (7 total) ─────────────────────────────────────────
  createStock({ symbol: "BFB",   name: "Brown-Forman Corporation Class B",  yahooSymbol: "BF-B", finnhubSymbol: "BF.B" }),
  createStock({ symbol: "KMB",   name: "Kimberly-Clark Corporation",        yahooSymbol: "KMB", finnhubSymbol: "KMB" }),
  createStock({ symbol: "HSY",   name: "Hershey Company",                   yahooSymbol: "HSY", finnhubSymbol: "HSY" }),
  createStock({ symbol: "TSN",   name: "Tyson Foods Inc.",                  yahooSymbol: "TSN", finnhubSymbol: "TSN" }),
  createStock({ symbol: "GIS",   name: "General Mills Inc.",                yahooSymbol: "GIS", finnhubSymbol: "GIS" }),
  createStock({ symbol: "MKC",   name: "McCormick & Company Inc.",          yahooSymbol: "MKC", finnhubSymbol: "MKC" }),
  createStock({ symbol: "STZ",   name: "Constellation Brands Inc.",         yahooSymbol: "STZ", finnhubSymbol: "STZ" }),

  // ─── COMMUNICATIONS & TELECOM (7 total) ─────────────────────────────────
  createStock({ symbol: "CMCSA", name: "Comcast Corporation Class A",       yahooSymbol: "CMCSA", finnhubSymbol: "CMCSA" }),
  createStock({ symbol: "TMUS",  name: "T-Mobile US Inc.",                  yahooSymbol: "TMUS", finnhubSymbol: "TMUS" }),
  createStock({ symbol: "CHTR",  name: "Charter Communications Inc.",       yahooSymbol: "CHTR", finnhubSymbol: "CHTR" }),
  createStock({ symbol: "FOX",   name: "Fox Corporation",                   yahooSymbol: "FOX", finnhubSymbol: "FOX" }),
  createStock({ symbol: "FOXA",  name: "Fox Corporation Class A",           yahooSymbol: "FOXA", finnhubSymbol: "FOXA" }),
  createStock({ symbol: "WBD",   name: "Warner Bros. Discovery Inc.",       yahooSymbol: "WBD", finnhubSymbol: "WBD" }),
  createStock({ symbol: "LUMN",  name: "Lumen Technologies Inc.",           yahooSymbol: "LUMN", finnhubSymbol: "LUMN" }),

  // ─── UTILITIES (8 total) ──────────────────────────────────────────────────
  createStock({ symbol: "NEE",   name: "NextEra Energy Inc.",               yahooSymbol: "NEE", finnhubSymbol: "NEE" }),
  createStock({ symbol: "DUK",   name: "Duke Energy Corporation",           yahooSymbol: "DUK", finnhubSymbol: "DUK" }),
  createStock({ symbol: "SO",    name: "Southern Company",                  yahooSymbol: "SO", finnhubSymbol: "SO" }),
  createStock({ symbol: "EXC",   name: "Exelon Corporation",                yahooSymbol: "EXC", finnhubSymbol: "EXC" }),
  createStock({ symbol: "AEP",   name: "American Electric Power Company Inc", yahooSymbol: "AEP", finnhubSymbol: "AEP" }),
  createStock({ symbol: "XEL",   name: "Xcel Energy Inc.",                  yahooSymbol: "XEL", finnhubSymbol: "XEL" }),
  createStock({ symbol: "PEG",   name: "Public Service Enterprise Group Inc", yahooSymbol: "PEG", finnhubSymbol: "PEG" }),
  createStock({ symbol: "AWK",   name: "American Water Works Company Inc.", yahooSymbol: "AWK", finnhubSymbol: "AWK" }),

  // ─── EUROPEAN STOCKS - MAJOR CAPS (12 total) ──────────────────────────────
  createStock({ symbol: "SAP",   name: "SAP SE",                            yahooSymbol: "SAP", finnhubSymbol: "SAP" }),
  createStock({ symbol: "HEI",   name: "Heidelberg Materials AG",           yahooSymbol: "HEI", finnhubSymbol: "HEI" }),
  createStock({ symbol: "MBG",   name: "Mercedes-Benz Group AG",            yahooSymbol: "MBG", finnhubSymbol: "MBG" }),
  createStock({ symbol: "ALV",   name: "Allianz SE",                        yahooSymbol: "ALV", finnhubSymbol: "ALV" }),
  createStock({ symbol: "OR",    name: "L'Oréal S.A.",                      yahooSymbol: "OR", finnhubSymbol: "OR" }),
  createStock({ symbol: "NSRGY", name: "Nestlé S.A.",                       yahooSymbol: "NSRGY", finnhubSymbol: "NSRGY" }),
  createStock({ symbol: "NVS",   name: "Novartis AG",                       yahooSymbol: "NVS", finnhubSymbol: "NVS" }),
  createStock({ symbol: "NOK",   name: "Nokia Oyj",                         yahooSymbol: "NOK", finnhubSymbol: "NOK" }),
  createStock({ symbol: "ERIC",  name: "Ericsson",                          yahooSymbol: "ERIC", finnhubSymbol: "ERIC" }),
  createStock({ symbol: "UL",    name: "Unilever PLC",                      yahooSymbol: "UL", finnhubSymbol: "UL" }),
  createStock({ symbol: "GSK",   name: "GlaxoSmithKline PLC",               yahooSymbol: "GSK", finnhubSymbol: "GSK" }),
  createStock({ symbol: "AZN",   name: "AstraZeneca PLC",                   yahooSymbol: "AZN", finnhubSymbol: "AZN" }),

  // ─── ASIA-PACIFIC STOCKS (10 total) ────────────────────────────────────────
  createStock({ symbol: "HDB",   name: "HDFC Bank Limited",                 yahooSymbol: "HDB", finnhubSymbol: "HDB" }),
  createStock({ symbol: "INFY",  name: "Infosys Limited",                   yahooSymbol: "INFY", finnhubSymbol: "INFY" }),
  createStock({ symbol: "IBN",   name: "ICICI Bank Limited",                yahooSymbol: "IBN", finnhubSymbol: "IBN" }),
  createStock({ symbol: "WIT",   name: "Wipro Limited",                     yahooSymbol: "WIT", finnhubSymbol: "WIT" }),
  createStock({ symbol: "HMC",   name: "Hyundai Motor Company",             yahooSymbol: "HMC", finnhubSymbol: "HMC" }),
  createStock({ symbol: "SFTBY", name: "SoftBank Group Corp.",              yahooSymbol: "SFTBY", finnhubSymbol: "SFTBY" }),
  createStock({ symbol: "FAST",  name: "Fastenal Company",                  yahooSymbol: "FAST", finnhubSymbol: "FAST" }),
  createStock({ symbol: "VROOM", name: "Vroom Inc.",                        yahooSymbol: "VRM", finnhubSymbol: "VRM" }),
  createStock({ symbol: "DKNG",  name: "DraftKings Inc.",                   yahooSymbol: "DKNG", finnhubSymbol: "DKNG" }),
  createStock({ symbol: "PENN",  name: "Penn Entertainment Inc.",           yahooSymbol: "PENN", finnhubSymbol: "PENN" }),

  // ─── ALTERNATIVE ETFs (25 total) ───────────────────────────────────────────
  createETF({ symbol: "GLD",  name: "SPDR Gold Shares",                     yahooSymbol: "GLD" }),
  createETF({ symbol: "SLV",  name: "iShares Silver Trust",                  yahooSymbol: "SLV" }),
  createETF({ symbol: "USO",  name: "United States Oil Fund LP",            yahooSymbol: "USO" }),
  createETF({ symbol: "DBC",  name: "Commodities Select Sector SPDR Fund",   yahooSymbol: "DBC" }),
  createETF({ symbol: "GLDM", name: "SPDR Gold Minishares ETF",              yahooSymbol: "GLDM" }),
  createETF({ symbol: "EEM",  name: "iShares MSCI Emerging Markets ETF",    yahooSymbol: "EEM" }),
  createETF({ symbol: "IEMG", name: "iShares Core MSCI Emerging Markets ETF", yahooSymbol: "IEMG" }),
  createETF({ symbol: "EWJ",  name: "iShares MSCI Japan ETF",               yahooSymbol: "EWJ" }),
  createETF({ symbol: "EWG",  name: "iShares MSCI Germany ETF",             yahooSymbol: "EWG" }),
  createETF({ symbol: "EWU",  name: "iShares MSCI United Kingdom ETF",      yahooSymbol: "EWU" }),
  createETF({ symbol: "EWH",  name: "iShares MSCI Hong Kong ETF",           yahooSymbol: "EWH" }),
  createETF({ symbol: "RSP",  name: "Invesco S&P 500 Equal Weight ETF",     yahooSymbol: "RSP" }),
  createETF({ symbol: "DGRO", name: "iShares Core Dividend Growth ETF",     yahooSymbol: "DGRO" }),
  createETF({ symbol: "VYM",  name: "Vanguard High Dividend Yield ETF",     yahooSymbol: "VYM" }),
  createETF({ symbol: "HYG",  name: "iShares High Yield Corp Bond ETF",     yahooSymbol: "HYG" }),
  createETF({ symbol: "VCIT", name: "Vanguard Intermediate-Term Corp Bond", yahooSymbol: "VCIT" }),
  createETF({ symbol: "LQD",  name: "iShares Investment Grade Corp Bond",   yahooSymbol: "LQD" }),
  createETF({ symbol: "VGIT", name: "Vanguard Intermediate-Term Govt Bond",  yahooSymbol: "VGIT" }),
  createETF({ symbol: "VCSH", name: "Vanguard Short-Term Corp Bond ETF",    yahooSymbol: "VCSH" }),
  createETF({ symbol: "PSP",  name: "Invesco Preferred Stock ETF",          yahooSymbol: "PSP" }),
  createETF({ symbol: "JEPI", name: "JPMorgan Equity Premium Income ETF",   yahooSymbol: "JEPI" }),
  createETF({ symbol: "VGSLX", name: "Vanguard Growth And Income ETF",      yahooSymbol: "VGSLX" }),
  createETF({ symbol: "SCHB", name: "Schwab US Broad Market ETF",           yahooSymbol: "SCHB" }),
  createETF({ symbol: "SCHA", name: "Schwab US Small-Cap ETF",              yahooSymbol: "SCHA" }),
  createETF({ symbol: "SCHE", name: "Schwab US Emerging Markets Equity ETF", yahooSymbol: "SCHE" }),

  // ─── ADDITIONAL CRYPTO (14 total) ─────────────────────────────────────────
  createCrypto({ symbol: "BNBUSD",  name: "Binance Coin",      yahooSymbol: "BNB-USD", tradingViewSymbol: "BINANCE:BNBUSDT" }),
  createCrypto({ symbol: "MATIUSD", name: "Polygon",           yahooSymbol: "MATIC-USD", tradingViewSymbol: "BINANCE:MATICUSDT" }),
  createCrypto({ symbol: "FTTUSD",  name: "Filecoin",          yahooSymbol: "FIL-USD", tradingViewSymbol: "BINANCE:FILUSDT" }),
  createCrypto({ symbol: "VETUSD",  name: "VeChain",           yahooSymbol: "VET-USD", tradingViewSymbol: "BINANCE:VETUSDT" }),
  createCrypto({ symbol: "ATOMUSD", name: "Cosmos",            yahooSymbol: "ATOM-USD", tradingViewSymbol: "BINANCE:ATOMUSDT" }),
  createCrypto({ symbol: "MONERO",  name: "Monero",            yahooSymbol: "XMR-USD", tradingViewSymbol: "BINANCE:XMRUSDT" }),
  createCrypto({ symbol: "ZCASH",   name: "Zcash",             yahooSymbol: "ZEC-USD", tradingViewSymbol: "BINANCE:ZECUSDT" }),
  createCrypto({ symbol: "THETA",   name: "Theta Token",       yahooSymbol: "THETA-USD", tradingViewSymbol: "BINANCE:THETAUSDT" }),
  createCrypto({ symbol: "IOTA",    name: "IOTA",              yahooSymbol: "IOTA-USD", tradingViewSymbol: "BINANCE:IOTAUSDT" }),
  createCrypto({ symbol: "NEO",     name: "Neo",               yahooSymbol: "NEO-USD", tradingViewSymbol: "BINANCE:NEOUSDT" }),
  createCrypto({ symbol: "EOS",     name: "EOS",               yahooSymbol: "EOS-USD", tradingViewSymbol: "BINANCE:EOSUSDT" }),
  createCrypto({ symbol: "TRON",    name: "TRON",              yahooSymbol: "TRX-USD", tradingViewSymbol: "BINANCE:TRXUSDT" }),
  createCrypto({ symbol: "HEDERA",  name: "Hedera Hashgraph",  yahooSymbol: "HBAR-USD", tradingViewSymbol: "BINANCE:HBARUSDT" }),
  createCrypto({ symbol: "APTOS",   name: "Aptos",             yahooSymbol: "APT-USD", tradingViewSymbol: "BINANCE:APTUSDT" }),

  // ─── ADDITIONAL COMMODITIES (8 total) ────────────────────────────────────
  createCommodity({ symbol: "PALLADIUM", name: "Palladium", yahooSymbol: "PA=F", tradingViewSymbol: "COMEX:PA1!" }),
  createCommodity({ symbol: "PLATINUM",  name: "Platinum",  yahooSymbol: "PL=F", tradingViewSymbol: "COMEX:PL1!" }),
  createCommodity({ symbol: "ZINC",      name: "Zinc",      yahooSymbol: "ZN=F", tradingViewSymbol: "COMEX:ZN1!" }),
  createCommodity({ symbol: "ALUMINUM",  name: "Aluminum",  yahooSymbol: "ALI=F", tradingViewSymbol: "COMEX:ALI1!" }),
  createCommodity({ symbol: "CORN",      name: "Corn",      yahooSymbol: "ZC=F", tradingViewSymbol: "CBOT:ZC1!" }),
  createCommodity({ symbol: "WHEAT",     name: "Wheat",     yahooSymbol: "ZW=F", tradingViewSymbol: "CBOT:ZW1!" }),
  createCommodity({ symbol: "SOYBEANS",  name: "Soybeans",  yahooSymbol: "ZS=F", tradingViewSymbol: "CBOT:ZS1!" }),
  createCommodity({ symbol: "SUGAR",     name: "Sugar",     yahooSymbol: "SB=F", tradingViewSymbol: "ICEUS:SB1!" }),

  // ─── ADDITIONAL FOREX (15 total) ──────────────────────────────────────────
  createForex({ symbol: "CHFUSD", name: "Swiss Franc / Dollar USA",       yahooSymbol: "CHFUSD=X", tradingViewSymbol: "FX:CHFUSD" }),
  createForex({ symbol: "AUDUSD", name: "Australian Dollar / US Dollar",  yahooSymbol: "AUDUSD=X", tradingViewSymbol: "FX:AUDUSD" }),
  createForex({ symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", yahooSymbol: "NZDUSD=X", tradingViewSymbol: "FX:NZDUSD" }),
  createForex({ symbol: "CADUSD", name: "Canadian Dollar / US Dollar",    yahooSymbol: "CADUSD=X", tradingViewSymbol: "FX:CADUSD" }),
  createForex({ symbol: "SGDUSD", name: "Singapore Dollar / US Dollar",   yahooSymbol: "SGDUSD=X", tradingViewSymbol: "FX:SGDUSD" }),
  createForex({ symbol: "HKDUSD", name: "Hong Kong Dollar / US Dollar",   yahooSymbol: "HKDUSD=X", tradingViewSymbol: "FX:HKDUSD" }),
  createForex({ symbol: "INRUSD", name: "Indian Rupee / US Dollar",       yahooSymbol: "INRUSD=X", tradingViewSymbol: "FX:INRUSD" }),
  createForex({ symbol: "ZARUSD", name: "South African Rand / US Dollar", yahooSymbol: "ZARUSD=X", tradingViewSymbol: "FX:ZARUSD" }),
  createForex({ symbol: "BRLUSD", name: "Brazilian Real / US Dollar",     yahooSymbol: "BRLUSD=X", tradingViewSymbol: "FX:BRLUSD" }),
  createForex({ symbol: "MXNUSD", name: "Mexican Peso / US Dollar",       yahooSymbol: "MXNUSD=X", tradingViewSymbol: "FX:MXNUSD" }),
  createForex({ symbol: "GBPEUR", name: "British Pound / Euro",           yahooSymbol: "GBPEUR=X", tradingViewSymbol: "FX:GBPEUR" }),
  createForex({ symbol: "EURJPY", name: "Euro / Japanese Yen",            yahooSymbol: "EURJPY=X", tradingViewSymbol: "FX:EURJPY" }),
  createForex({ symbol: "AUDJPY", name: "Australian Dollar / Yen",        yahooSymbol: "AUDJPY=X", tradingViewSymbol: "FX:AUDJPY" }),
  createForex({ symbol: "NZDJPY", name: "New Zealand Dollar / Yen",       yahooSymbol: "NZDJPY=X", tradingViewSymbol: "FX:NZDJPY" }),
  createForex({ symbol: "CADJPY", name: "Canadian Dollar / Yen",          yahooSymbol: "CADJPY=X", tradingViewSymbol: "FX:CADJPY" }),

  // ─── ADDITIONAL INDICES (6 total) ─────────────────────────────────────────
  createIndex({ symbol: "IXIC",  name: "NASDAQ Composite",                yahooSymbol: "^IXIC", tradingViewSymbol: "NASDAQ:CCMP" }),
  createIndex({ symbol: "DJT",   name: "Dow Jones Transportation Average", yahooSymbol: "^DJT", tradingViewSymbol: "DJ:DJT" }),
  createIndex({ symbol: "NYA",   name: "NYSE Composite Index",            yahooSymbol: "^NYA", tradingViewSymbol: "NYSE:NYA" }),
  createIndex({ symbol: "HUI",   name: "NYSE Arca Gold Bugs Index",       yahooSymbol: "^HUI", tradingViewSymbol: "NYSE:HUI" }),
  createIndex({ symbol: "XAU",   name: "Gold Index",                      yahooSymbol: "^XAU", tradingViewSymbol: "TVC:GOLD" }),
  createIndex({ symbol: "MOVE",  name: "ICE BofA Move Index",             yahooSymbol: "^MOVE", tradingViewSymbol: "TVC:MOVE" }),

  // ─── BONDS / ADDITIONAL RATES (3 total) ───────────────────────────────────
  createBond({ symbol: "US02Y", name: "US Treasury 2Y", yahooSymbol: "^IRX", tradingViewSymbol: "TVC:US2Y" }),
  createBond({ symbol: "US05Y", name: "US Treasury 5Y", yahooSymbol: "^FVX", tradingViewSymbol: "TVC:US5Y" }),
  createBond({ symbol: "US03M", name: "US Treasury 3M Bill", yahooSymbol: "^IRX", tradingViewSymbol: "TVC:US03M" }),

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 8A EXPANSION — 300+ additional validated assets
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── FINANCIAL DATA & EXCHANGES (10 total) ─────────────────────────────────
  createStock({ symbol: "SPGI",  name: "S&P Global Inc.",                       yahooSymbol: "SPGI",  tradingViewSymbol: "NYSE:SPGI" }),
  createStock({ symbol: "MCO",   name: "Moody's Corporation",                   yahooSymbol: "MCO",   tradingViewSymbol: "NYSE:MCO" }),
  createStock({ symbol: "ICE",   name: "Intercontinental Exchange Inc.",         yahooSymbol: "ICE",   tradingViewSymbol: "NYSE:ICE" }),
  createStock({ symbol: "CME",   name: "CME Group Inc.",                         yahooSymbol: "CME",   tradingViewSymbol: "NASDAQ:CME" }),
  createStock({ symbol: "BLK",   name: "BlackRock Inc.",                         yahooSymbol: "BLK",   tradingViewSymbol: "NYSE:BLK" }),
  createStock({ symbol: "STT",   name: "State Street Corporation",               yahooSymbol: "STT",   tradingViewSymbol: "NYSE:STT" }),
  createStock({ symbol: "FIS",   name: "Fidelity National Information Services", yahooSymbol: "FIS",   tradingViewSymbol: "NYSE:FIS" }),
  createStock({ symbol: "GPN",   name: "Global Payments Inc.",                   yahooSymbol: "GPN",   tradingViewSymbol: "NYSE:GPN" }),

  // ─── INSURANCE & ALTERNATIVE ASSET MANAGEMENT (13 total) ─────────────────
  createStock({ symbol: "KKR",   name: "KKR & Co. Inc.",                        yahooSymbol: "KKR",   tradingViewSymbol: "NYSE:KKR" }),
  createStock({ symbol: "BX",    name: "Blackstone Inc.",                        yahooSymbol: "BX",    tradingViewSymbol: "NYSE:BX" }),
  createStock({ symbol: "APO",   name: "Apollo Global Management Inc.",          yahooSymbol: "APO",   tradingViewSymbol: "NYSE:APO" }),
  createStock({ symbol: "CG",    name: "Carlyle Group Inc.",                     yahooSymbol: "CG",    tradingViewSymbol: "NASDAQ:CG" }),
  createStock({ symbol: "ARES",  name: "Ares Management Corporation",            yahooSymbol: "ARES",  tradingViewSymbol: "NYSE:ARES" }),
  createStock({ symbol: "PGR",   name: "Progressive Corporation",                yahooSymbol: "PGR",   tradingViewSymbol: "NYSE:PGR" }),
  createStock({ symbol: "AJG",   name: "Arthur J. Gallagher & Co.",              yahooSymbol: "AJG",   tradingViewSymbol: "NYSE:AJG" }),
  createStock({ symbol: "CB",    name: "Chubb Limited",                          yahooSymbol: "CB",    tradingViewSymbol: "NYSE:CB" }),
  createStock({ symbol: "ALL",   name: "Allstate Corporation",                   yahooSymbol: "ALL",   tradingViewSymbol: "NYSE:ALL" }),
  createStock({ symbol: "AFL",   name: "Aflac Incorporated",                     yahooSymbol: "AFL",   tradingViewSymbol: "NYSE:AFL" }),
  createStock({ symbol: "PRU",   name: "Prudential Financial Inc.",              yahooSymbol: "PRU",   tradingViewSymbol: "NYSE:PRU" }),
  createStock({ symbol: "MET",   name: "MetLife Inc.",                           yahooSymbol: "MET",   tradingViewSymbol: "NYSE:MET" }),

  // ─── REAL ESTATE / REITs (10 total) ────────────────────────────────────────
  createStock({ symbol: "AMT",   name: "American Tower Corporation",             yahooSymbol: "AMT",   tradingViewSymbol: "NYSE:AMT" }),
  createStock({ symbol: "EQIX",  name: "Equinix Inc.",                           yahooSymbol: "EQIX",  tradingViewSymbol: "NASDAQ:EQIX" }),
  createStock({ symbol: "CCI",   name: "Crown Castle Inc.",                      yahooSymbol: "CCI",   tradingViewSymbol: "NYSE:CCI" }),
  createStock({ symbol: "O",     name: "Realty Income Corporation",              yahooSymbol: "O",     tradingViewSymbol: "NYSE:O" }),
  createStock({ symbol: "SPG",   name: "Simon Property Group Inc.",              yahooSymbol: "SPG",   tradingViewSymbol: "NYSE:SPG" }),
  createStock({ symbol: "PSA",   name: "Public Storage",                         yahooSymbol: "PSA",   tradingViewSymbol: "NYSE:PSA" }),
  createStock({ symbol: "EQR",   name: "Equity Residential",                     yahooSymbol: "EQR",   tradingViewSymbol: "NYSE:EQR" }),
  createStock({ symbol: "AVB",   name: "AvalonBay Communities Inc.",             yahooSymbol: "AVB",   tradingViewSymbol: "NYSE:AVB" }),
  createStock({ symbol: "WPC",   name: "W.P. Carey Inc.",                        yahooSymbol: "WPC",   tradingViewSymbol: "NYSE:WPC" }),
  createStock({ symbol: "WELL",  name: "Welltower Inc.",                         yahooSymbol: "WELL",  tradingViewSymbol: "NYSE:WELL" }),

  // ─── INDUSTRIALS & BUSINESS SERVICES (15 total) ────────────────────────────
  createStock({ symbol: "ADP",   name: "Automatic Data Processing Inc.",         yahooSymbol: "ADP",   tradingViewSymbol: "NASDAQ:ADP" }),
  createStock({ symbol: "PAYX",  name: "Paychex Inc.",                           yahooSymbol: "PAYX",  tradingViewSymbol: "NASDAQ:PAYX" }),
  createStock({ symbol: "CTAS",  name: "Cintas Corporation",                     yahooSymbol: "CTAS",  tradingViewSymbol: "NASDAQ:CTAS" }),
  createStock({ symbol: "URI",   name: "United Rentals Inc.",                    yahooSymbol: "URI",   tradingViewSymbol: "NYSE:URI" }),
  createStock({ symbol: "WM",    name: "Waste Management Inc.",                  yahooSymbol: "WM",    tradingViewSymbol: "NYSE:WM" }),
  createStock({ symbol: "RSG",   name: "Republic Services Inc.",                 yahooSymbol: "RSG",   tradingViewSymbol: "NYSE:RSG" }),
  createStock({ symbol: "ETN",   name: "Eaton Corporation PLC",                  yahooSymbol: "ETN",   tradingViewSymbol: "NYSE:ETN" }),
  createStock({ symbol: "EMR",   name: "Emerson Electric Co.",                   yahooSymbol: "EMR",   tradingViewSymbol: "NYSE:EMR" }),
  createStock({ symbol: "PH",    name: "Parker Hannifin Corporation",            yahooSymbol: "PH",    tradingViewSymbol: "NYSE:PH" }),
  createStock({ symbol: "ITW",   name: "Illinois Tool Works Inc.",               yahooSymbol: "ITW",   tradingViewSymbol: "NASDAQ:ITW" }),
  createStock({ symbol: "MMM",   name: "3M Company",                             yahooSymbol: "MMM",   tradingViewSymbol: "NYSE:MMM" }),
  createStock({ symbol: "AME",   name: "AMETEK Inc.",                            yahooSymbol: "AME",   tradingViewSymbol: "NYSE:AME" }),
  createStock({ symbol: "GWW",   name: "W.W. Grainger Inc.",                    yahooSymbol: "GWW",   tradingViewSymbol: "NYSE:GWW" }),
  createStock({ symbol: "VRSK",  name: "Verisk Analytics Inc.",                  yahooSymbol: "VRSK",  tradingViewSymbol: "NASDAQ:VRSK" }),
  createStock({ symbol: "CPRT",  name: "Copart Inc.",                            yahooSymbol: "CPRT",  tradingViewSymbol: "NASDAQ:CPRT" }),

  // ─── ENERGY: UPSTREAM, MIDSTREAM & SERVICES (15 total) ────────────────────
  createStock({ symbol: "OXY",   name: "Occidental Petroleum Corporation",       yahooSymbol: "OXY",   tradingViewSymbol: "NYSE:OXY" }),
  createStock({ symbol: "PSX",   name: "Phillips 66",                            yahooSymbol: "PSX",   tradingViewSymbol: "NYSE:PSX" }),
  createStock({ symbol: "VLO",   name: "Valero Energy Corporation",              yahooSymbol: "VLO",   tradingViewSymbol: "NYSE:VLO" }),
  createStock({ symbol: "MPC",   name: "Marathon Petroleum Corporation",         yahooSymbol: "MPC",   tradingViewSymbol: "NYSE:MPC" }),
  createStock({ symbol: "SLB",   name: "SLB",                                    yahooSymbol: "SLB",   tradingViewSymbol: "NYSE:SLB" }),
  createStock({ symbol: "HAL",   name: "Halliburton Company",                    yahooSymbol: "HAL",   tradingViewSymbol: "NYSE:HAL" }),
  createStock({ symbol: "BKR",   name: "Baker Hughes Company",                   yahooSymbol: "BKR",   tradingViewSymbol: "NASDAQ:BKR" }),
  createStock({ symbol: "EOG",   name: "EOG Resources Inc.",                     yahooSymbol: "EOG",   tradingViewSymbol: "NYSE:EOG" }),
  createStock({ symbol: "DVN",   name: "Devon Energy Corporation",               yahooSymbol: "DVN",   tradingViewSymbol: "NYSE:DVN" }),
  createStock({ symbol: "FANG",  name: "Diamondback Energy Inc.",                yahooSymbol: "FANG",  tradingViewSymbol: "NASDAQ:FANG" }),
  createStock({ symbol: "KMI",   name: "Kinder Morgan Inc.",                     yahooSymbol: "KMI",   tradingViewSymbol: "NYSE:KMI" }),
  createStock({ symbol: "WMB",   name: "Williams Companies Inc.",                yahooSymbol: "WMB",   tradingViewSymbol: "NASDAQ:WMB" }),
  createStock({ symbol: "OKE",   name: "ONEOK Inc.",                             yahooSymbol: "OKE",   tradingViewSymbol: "NYSE:OKE" }),

  // ─── HEALTHCARE: MANAGED CARE, DEVICES & BIOTECH (16 total) ───────────────
  createStock({ symbol: "CI",    name: "Cigna Group",                            yahooSymbol: "CI",    tradingViewSymbol: "NYSE:CI" }),
  createStock({ symbol: "HUM",   name: "Humana Inc.",                            yahooSymbol: "HUM",   tradingViewSymbol: "NYSE:HUM" }),
  createStock({ symbol: "MCK",   name: "McKesson Corporation",                   yahooSymbol: "MCK",   tradingViewSymbol: "NYSE:MCK" }),
  createStock({ symbol: "MDT",   name: "Medtronic PLC",                          yahooSymbol: "MDT",   tradingViewSymbol: "NYSE:MDT" }),
  createStock({ symbol: "BSX",   name: "Boston Scientific Corporation",          yahooSymbol: "BSX",   tradingViewSymbol: "NYSE:BSX" }),
  createStock({ symbol: "BDX",   name: "Becton Dickinson and Company",           yahooSymbol: "BDX",   tradingViewSymbol: "NYSE:BDX" }),
  createStock({ symbol: "DHR",   name: "Danaher Corporation",                    yahooSymbol: "DHR",   tradingViewSymbol: "NYSE:DHR" }),
  createStock({ symbol: "IDXX",  name: "IDEXX Laboratories Inc.",                yahooSymbol: "IDXX",  tradingViewSymbol: "NASDAQ:IDXX" }),
  createStock({ symbol: "DXCM",  name: "DexCom Inc.",                            yahooSymbol: "DXCM",  tradingViewSymbol: "NASDAQ:DXCM" }),
  createStock({ symbol: "MRNA",  name: "Moderna Inc.",                           yahooSymbol: "MRNA",  tradingViewSymbol: "NASDAQ:MRNA" }),
  createStock({ symbol: "BIIB",  name: "Biogen Inc.",                            yahooSymbol: "BIIB",  tradingViewSymbol: "NASDAQ:BIIB" }),
  createStock({ symbol: "ILMN",  name: "Illumina Inc.",                          yahooSymbol: "ILMN",  tradingViewSymbol: "NASDAQ:ILMN" }),
  createStock({ symbol: "ZBH",   name: "Zimmer Biomet Holdings Inc.",            yahooSymbol: "ZBH",   tradingViewSymbol: "NYSE:ZBH" }),
  createStock({ symbol: "RMD",   name: "ResMed Inc.",                            yahooSymbol: "RMD",   tradingViewSymbol: "NYSE:RMD" }),
  createStock({ symbol: "GEHC",  name: "GE HealthCare Technologies Inc.",        yahooSymbol: "GEHC",  tradingViewSymbol: "NASDAQ:GEHC" }),
  createStock({ symbol: "A",     name: "Agilent Technologies Inc.",              yahooSymbol: "A",     tradingViewSymbol: "NYSE:A" }),

  // ─── CONSUMER: TRAVEL, RETAIL & AUTOMOTIVE (15 total) ─────────────────────
  createStock({ symbol: "BKNG",  name: "Booking Holdings Inc.",                  yahooSymbol: "BKNG",  tradingViewSymbol: "NASDAQ:BKNG" }),
  createStock({ symbol: "EXPE",  name: "Expedia Group Inc.",                     yahooSymbol: "EXPE",  tradingViewSymbol: "NASDAQ:EXPE" }),
  createStock({ symbol: "ROST",  name: "Ross Stores Inc.",                       yahooSymbol: "ROST",  tradingViewSymbol: "NASDAQ:ROST" }),
  createStock({ symbol: "TJX",   name: "TJX Companies Inc.",                     yahooSymbol: "TJX",   tradingViewSymbol: "NYSE:TJX" }),
  createStock({ symbol: "DLTR",  name: "Dollar Tree Inc.",                       yahooSymbol: "DLTR",  tradingViewSymbol: "NASDAQ:DLTR" }),
  createStock({ symbol: "DG",    name: "Dollar General Corporation",             yahooSymbol: "DG",    tradingViewSymbol: "NYSE:DG" }),
  createStock({ symbol: "KR",    name: "Kroger Co.",                             yahooSymbol: "KR",    tradingViewSymbol: "NYSE:KR" }),
  createStock({ symbol: "SYY",   name: "Sysco Corporation",                      yahooSymbol: "SYY",   tradingViewSymbol: "NYSE:SYY" }),
  createStock({ symbol: "YUM",   name: "Yum! Brands Inc.",                       yahooSymbol: "YUM",   tradingViewSymbol: "NYSE:YUM" }),
  createStock({ symbol: "DPZ",   name: "Domino's Pizza Inc.",                    yahooSymbol: "DPZ",   tradingViewSymbol: "NASDAQ:DPZ" }),
  createStock({ symbol: "F",     name: "Ford Motor Company",                     yahooSymbol: "F",     tradingViewSymbol: "NYSE:F" }),
  createStock({ symbol: "GM",    name: "General Motors Company",                 yahooSymbol: "GM",    tradingViewSymbol: "NYSE:GM" }),
  createStock({ symbol: "RIVN",  name: "Rivian Automotive Inc.",                 yahooSymbol: "RIVN",  tradingViewSymbol: "NASDAQ:RIVN" }),
  createStock({ symbol: "TSCO",  name: "Tractor Supply Company",                 yahooSymbol: "TSCO",  tradingViewSymbol: "NASDAQ:TSCO" }),
  createStock({ symbol: "RCL",   name: "Royal Caribbean Cruises Ltd.",           yahooSymbol: "RCL",   tradingViewSymbol: "NYSE:RCL" }),

  // ─── AI, CLOUD & HYPERGROWTH TECH (25 total) ───────────────────────────────
  createStock({ symbol: "TTD",   name: "Trade Desk Inc.",                        yahooSymbol: "TTD",   tradingViewSymbol: "NASDAQ:TTD" }),
  createStock({ symbol: "RBLX",  name: "Roblox Corporation",                     yahooSymbol: "RBLX",  tradingViewSymbol: "NYSE:RBLX" }),
  createStock({ symbol: "ARM",   name: "Arm Holdings PLC",                       yahooSymbol: "ARM",   tradingViewSymbol: "NASDAQ:ARM" }),
  createStock({ symbol: "SMCI",  name: "Super Micro Computer Inc.",              yahooSymbol: "SMCI",  tradingViewSymbol: "NASDAQ:SMCI" }),
  createStock({ symbol: "DELL",  name: "Dell Technologies Inc.",                 yahooSymbol: "DELL",  tradingViewSymbol: "NYSE:DELL" }),
  createStock({ symbol: "MDB",   name: "MongoDB Inc.",                           yahooSymbol: "MDB",   tradingViewSymbol: "NASDAQ:MDB" }),
  createStock({ symbol: "ZS",    name: "Zscaler Inc.",                           yahooSymbol: "ZS",    tradingViewSymbol: "NASDAQ:ZS" }),
  createStock({ symbol: "MELI",  name: "MercadoLibre Inc.",                      yahooSymbol: "MELI",  tradingViewSymbol: "NASDAQ:MELI" }),
  createStock({ symbol: "TTWO",  name: "Take-Two Interactive Software Inc.",     yahooSymbol: "TTWO",  tradingViewSymbol: "NASDAQ:TTWO" }),
  createStock({ symbol: "SNAP",  name: "Snap Inc.",                              yahooSymbol: "SNAP",  tradingViewSymbol: "NYSE:SNAP" }),
  createStock({ symbol: "PINS",  name: "Pinterest Inc.",                         yahooSymbol: "PINS",  tradingViewSymbol: "NYSE:PINS" }),
  createStock({ symbol: "LYFT",  name: "Lyft Inc.",                              yahooSymbol: "LYFT",  tradingViewSymbol: "NASDAQ:LYFT" }),
  createStock({ symbol: "HOOD",  name: "Robinhood Markets Inc.",                 yahooSymbol: "HOOD",  tradingViewSymbol: "NASDAQ:HOOD" }),
  createStock({ symbol: "DOCS",  name: "Doximity Inc.",                          yahooSymbol: "DOCS",  tradingViewSymbol: "NYSE:DOCS" }),
  createStock({ symbol: "HUBS",  name: "HubSpot Inc.",                           yahooSymbol: "HUBS",  tradingViewSymbol: "NYSE:HUBS" }),
  createStock({ symbol: "OKTA",  name: "Okta Inc.",                              yahooSymbol: "OKTA",  tradingViewSymbol: "NASDAQ:OKTA" }),
  createStock({ symbol: "S",     name: "SentinelOne Inc.",                       yahooSymbol: "S",     tradingViewSymbol: "NYSE:S" }),
  createStock({ symbol: "DOCU",  name: "DocuSign Inc.",                          yahooSymbol: "DOCU",  tradingViewSymbol: "NASDAQ:DOCU" }),
  createStock({ symbol: "PATH",  name: "UiPath Inc.",                            yahooSymbol: "PATH",  tradingViewSymbol: "NYSE:PATH" }),
  createStock({ symbol: "AFRM",  name: "Affirm Holdings Inc.",                   yahooSymbol: "AFRM",  tradingViewSymbol: "NASDAQ:AFRM" }),
  createStock({ symbol: "APP",   name: "AppLovin Corporation",                   yahooSymbol: "APP",   tradingViewSymbol: "NASDAQ:APP" }),
  createStock({ symbol: "DT",    name: "Dynatrace Holdings Inc.",                yahooSymbol: "DT",    tradingViewSymbol: "NYSE:DT" }),
  createStock({ symbol: "ESTC",  name: "Elastic N.V.",                           yahooSymbol: "ESTC",  tradingViewSymbol: "NYSE:ESTC" }),
  createStock({ symbol: "ROKU",  name: "Roku Inc.",                              yahooSymbol: "ROKU",  tradingViewSymbol: "NASDAQ:ROKU" }),

  // ─── SEMICONDUCTORS & HARDWARE (EXPANDED) (7 total) ───────────────────────
  createStock({ symbol: "ASML",  name: "ASML Holding N.V.",                      yahooSymbol: "ASML",  tradingViewSymbol: "NASDAQ:ASML" }),
  createStock({ symbol: "MRVL",  name: "Marvell Technology Inc.",                yahooSymbol: "MRVL",  tradingViewSymbol: "NASDAQ:MRVL" }),
  createStock({ symbol: "ADI",   name: "Analog Devices Inc.",                    yahooSymbol: "ADI",   tradingViewSymbol: "NASDAQ:ADI" }),
  createStock({ symbol: "FTNT",  name: "Fortinet Inc.",                          yahooSymbol: "FTNT",  tradingViewSymbol: "NASDAQ:FTNT" }),
  createStock({ symbol: "HPQ",   name: "HP Inc.",                                yahooSymbol: "HPQ",   tradingViewSymbol: "NYSE:HPQ" }),
  createStock({ symbol: "NTAP",  name: "NetApp Inc.",                            yahooSymbol: "NTAP",  tradingViewSymbol: "NASDAQ:NTAP" }),
  createStock({ symbol: "CHKP",  name: "Check Point Software Technologies Ltd.", yahooSymbol: "CHKP",  tradingViewSymbol: "NASDAQ:CHKP" }),

  // ─── MATERIALS & MINING (11 total) ─────────────────────────────────────────
  createStock({ symbol: "FCX",   name: "Freeport-McMoRan Inc.",                  yahooSymbol: "FCX",   tradingViewSymbol: "NYSE:FCX" }),
  createStock({ symbol: "NUE",   name: "Nucor Corporation",                      yahooSymbol: "NUE",   tradingViewSymbol: "NYSE:NUE" }),
  createStock({ symbol: "STLD",  name: "Steel Dynamics Inc.",                    yahooSymbol: "STLD",  tradingViewSymbol: "NASDAQ:STLD" }),
  createStock({ symbol: "CLF",   name: "Cleveland-Cliffs Inc.",                  yahooSymbol: "CLF",   tradingViewSymbol: "NYSE:CLF" }),
  createStock({ symbol: "ALB",   name: "Albemarle Corporation",                  yahooSymbol: "ALB",   tradingViewSymbol: "NYSE:ALB" }),
  createStock({ symbol: "BALL",  name: "Ball Corporation",                       yahooSymbol: "BALL",  tradingViewSymbol: "NYSE:BALL" }),
  createStock({ symbol: "PKG",   name: "Packaging Corp of America",              yahooSymbol: "PKG",   tradingViewSymbol: "NYSE:PKG" }),
  createStock({ symbol: "IP",    name: "International Paper Company",            yahooSymbol: "IP",    tradingViewSymbol: "NYSE:IP" }),
  createStock({ symbol: "GOLD",  name: "Barrick Gold Corporation",               yahooSymbol: "GOLD",  tradingViewSymbol: "NYSE:GOLD" }),
  createStock({ symbol: "FNV",   name: "Franco-Nevada Corporation",              yahooSymbol: "FNV",   tradingViewSymbol: "NYSE:FNV" }),
  createStock({ symbol: "WPM",   name: "Wheaton Precious Metals Corp.",          yahooSymbol: "WPM",   tradingViewSymbol: "NYSE:WPM" }),

  // ─── DEFENSE, AEROSPACE & INDUSTRIAL (6 total) ─────────────────────────────
  createStock({ symbol: "LHX",   name: "L3Harris Technologies Inc.",             yahooSymbol: "LHX",   tradingViewSymbol: "NYSE:LHX" }),
  createStock({ symbol: "LDOS",  name: "Leidos Holdings Inc.",                   yahooSymbol: "LDOS",  tradingViewSymbol: "NYSE:LDOS" }),
  createStock({ symbol: "HII",   name: "Huntington Ingalls Industries Inc.",     yahooSymbol: "HII",   tradingViewSymbol: "NYSE:HII" }),
  createStock({ symbol: "PCAR",  name: "PACCAR Inc.",                            yahooSymbol: "PCAR",  tradingViewSymbol: "NASDAQ:PCAR" }),
  createStock({ symbol: "GEN",   name: "Gen Digital Inc.",                       yahooSymbol: "GEN",   tradingViewSymbol: "NASDAQ:GEN" }),
  createStock({ symbol: "CCL",   name: "Carnival Corporation & PLC",             yahooSymbol: "CCL",   tradingViewSymbol: "NYSE:CCL" }),

  // ─── ADDITIONAL FINANCIAL & SERVICES (8 total) ──────────────────────────────
  createStock({ symbol: "AON",   name: "Aon PLC",                                yahooSymbol: "AON",   tradingViewSymbol: "NYSE:AON" }),
  createStock({ symbol: "BP",    name: "BP PLC",                                 yahooSymbol: "BP",    tradingViewSymbol: "NYSE:BP" }),
  createStock({ symbol: "SHEL",  name: "Shell PLC",                              yahooSymbol: "SHEL",  tradingViewSymbol: "NYSE:SHEL" }),
  createStock({ symbol: "RIO",   name: "Rio Tinto PLC",                          yahooSymbol: "RIO",   tradingViewSymbol: "NYSE:RIO" }),
  createStock({ symbol: "BHP",   name: "BHP Group Limited",                      yahooSymbol: "BHP",   tradingViewSymbol: "NYSE:BHP" }),
  createStock({ symbol: "SPOT",  name: "Spotify Technology S.A.",                yahooSymbol: "SPOT",  tradingViewSymbol: "NYSE:SPOT" }),
  createStock({ symbol: "SAN",   name: "Banco Santander S.A.",                   yahooSymbol: "SAN",   tradingViewSymbol: "NYSE:SAN" }),
  createStock({ symbol: "BBVA",  name: "Banco Bilbao Vizcaya Argentaria S.A.",   yahooSymbol: "BBVA",  tradingViewSymbol: "NYSE:BBVA" }),
  createStock({ symbol: "ING",   name: "ING Groep N.V.",                         yahooSymbol: "ING",   tradingViewSymbol: "NYSE:ING" }),
  createStock({ symbol: "PHG",   name: "Philips N.V.",                           yahooSymbol: "PHG",   tradingViewSymbol: "NASDAQ:PHG" }),
  createStock({ symbol: "AEM",   name: "Agnico Eagle Mines Limited",             yahooSymbol: "AEM",   tradingViewSymbol: "NYSE:AEM" }),
  createStock({ symbol: "CNQ",   name: "Canadian Natural Resources Limited",     yahooSymbol: "CNQ",   tradingViewSymbol: "NYSE:CNQ" }),
  createStock({ symbol: "SU",    name: "Suncor Energy Inc.",                     yahooSymbol: "SU",    tradingViewSymbol: "NYSE:SU" }),

  // ─── INTERNATIONAL: ASIA, LATAM & GLOBAL (16 total) ───────────────────────
  createStock({ symbol: "BABA",  name: "Alibaba Group Holding Limited",          yahooSymbol: "BABA",  tradingViewSymbol: "NYSE:BABA" }),
  createStock({ symbol: "BIDU",  name: "Baidu Inc.",                             yahooSymbol: "BIDU",  tradingViewSymbol: "NASDAQ:BIDU" }),
  createStock({ symbol: "JD",    name: "JD.com Inc.",                            yahooSymbol: "JD",    tradingViewSymbol: "NASDAQ:JD" }),
  createStock({ symbol: "PDD",   name: "PDD Holdings Inc.",                      yahooSymbol: "PDD",   tradingViewSymbol: "NASDAQ:PDD" }),
  createStock({ symbol: "SE",    name: "Sea Limited",                            yahooSymbol: "SE",    tradingViewSymbol: "NYSE:SE" }),
  createStock({ symbol: "VALE",  name: "Vale S.A.",                              yahooSymbol: "VALE",  tradingViewSymbol: "NYSE:VALE" }),
  createStock({ symbol: "ITUB",  name: "Itaú Unibanco Holding S.A.",             yahooSymbol: "ITUB",  tradingViewSymbol: "NYSE:ITUB" }),
  createStock({ symbol: "BBD",   name: "Banco Bradesco S.A.",                    yahooSymbol: "BBD",   tradingViewSymbol: "NYSE:BBD" }),
  createStock({ symbol: "AMX",   name: "América Móvil SAB de CV",                yahooSymbol: "AMX",   tradingViewSymbol: "NYSE:AMX" }),
  createStock({ symbol: "RY",    name: "Royal Bank of Canada",                   yahooSymbol: "RY",    tradingViewSymbol: "NYSE:RY" }),
  createStock({ symbol: "TD",    name: "Toronto-Dominion Bank",                  yahooSymbol: "TD",    tradingViewSymbol: "NYSE:TD" }),
  createStock({ symbol: "NIO",   name: "NIO Inc.",                               yahooSymbol: "NIO",   tradingViewSymbol: "NYSE:NIO" }),
  createStock({ symbol: "TCOM",  name: "Trip.com Group Limited",                 yahooSymbol: "TCOM",  tradingViewSymbol: "NASDAQ:TCOM" }),
  createStock({ symbol: "KB",    name: "KB Financial Group Inc.",                yahooSymbol: "KB",    tradingViewSymbol: "NYSE:KB" }),
  createStock({ symbol: "GRAB",  name: "Grab Holdings Limited",                  yahooSymbol: "GRAB",  tradingViewSymbol: "NASDAQ:GRAB" }),
  createStock({ symbol: "TEVA",  name: "Teva Pharmaceutical Industries Ltd.",    yahooSymbol: "TEVA",  tradingViewSymbol: "NYSE:TEVA" }),

  // ─── ENTERTAINMENT & MEDIA (4 total) ────────────────────────────────────────
  createStock({ symbol: "LYV",   name: "Live Nation Entertainment Inc.",         yahooSymbol: "LYV",   tradingViewSymbol: "NYSE:LYV" }),
  createStock({ symbol: "EA",    name: "Electronic Arts Inc.",                   yahooSymbol: "EA",    tradingViewSymbol: "NASDAQ:EA" }),
  createStock({ symbol: "POOL",  name: "Pool Corporation",                       yahooSymbol: "POOL",  tradingViewSymbol: "NASDAQ:POOL" }),
  createStock({ symbol: "NDAQ",  name: "Nasdaq Inc.",                             yahooSymbol: "NDAQ",  tradingViewSymbol: "NASDAQ:NDAQ" }),
  createStock({ symbol: "MSCI",  name: "MSCI Inc.",                               yahooSymbol: "MSCI",  tradingViewSymbol: "NYSE:MSCI" }),
  createStock({ symbol: "BR",    name: "Broadridge Financial Solutions Inc.",     yahooSymbol: "BR",    tradingViewSymbol: "NYSE:BR" }),

  // ─── ETFs: BROAD MARKET & INCOME (7 total) ─────────────────────────────────
  createETF({ symbol: "IVV",   name: "iShares Core S&P 500 ETF",                yahooSymbol: "IVV",   tradingViewSymbol: "AMEX:IVV" }),
  createETF({ symbol: "SPLG",  name: "SPDR Portfolio S&P 500 ETF",              yahooSymbol: "SPLG",  tradingViewSymbol: "AMEX:SPLG" }),
  createETF({ symbol: "SCHG",  name: "Schwab US Large-Cap Growth ETF",          yahooSymbol: "SCHG",  tradingViewSymbol: "AMEX:SCHG" }),
  createETF({ symbol: "VIG",   name: "Vanguard Dividend Appreciation ETF",      yahooSymbol: "VIG",   tradingViewSymbol: "AMEX:VIG" }),
  createETF({ symbol: "HDV",   name: "iShares Core High Dividend ETF",          yahooSymbol: "HDV",   tradingViewSymbol: "AMEX:HDV" }),
  createETF({ symbol: "JEPQ",  name: "JPMorgan Nasdaq Equity Premium Income ETF",yahooSymbol: "JEPQ", tradingViewSymbol: "AMEX:JEPQ" }),
  createETF({ symbol: "QQQM",  name: "Invesco Nasdaq 100 ETF",                  yahooSymbol: "QQQM",  tradingViewSymbol: "NASDAQ:QQQM" }),

  // ─── ETFs: FIXED INCOME (5 total) ───────────────────────────────────────────
  createETF({ symbol: "BIL",   name: "SPDR Bloomberg 1-3 Month T-Bill ETF",     yahooSymbol: "BIL",   tradingViewSymbol: "AMEX:BIL" }),
  createETF({ symbol: "SHY",   name: "iShares 1-3 Year Treasury Bond ETF",      yahooSymbol: "SHY",   tradingViewSymbol: "NASDAQ:SHY" }),
  createETF({ symbol: "TIP",   name: "iShares TIPS Bond ETF",                   yahooSymbol: "TIP",   tradingViewSymbol: "AMEX:TIP" }),
  createETF({ symbol: "TLT",   name: "iShares 20+ Year Treasury Bond ETF",      yahooSymbol: "TLT",   tradingViewSymbol: "NASDAQ:TLT" }),
  createETF({ symbol: "IEF",   name: "iShares 7-10 Year Treasury Bond ETF",     yahooSymbol: "IEF",   tradingViewSymbol: "NASDAQ:IEF" }),

  // ─── ETFs: SECTOR (7 total) ─────────────────────────────────────────────────
  createETF({ symbol: "VNQ",   name: "Vanguard Real Estate ETF",                yahooSymbol: "VNQ",   tradingViewSymbol: "AMEX:VNQ" }),
  createETF({ symbol: "XLI",   name: "Industrial Select Sector SPDR Fund",      yahooSymbol: "XLI",   tradingViewSymbol: "AMEX:XLI" }),
  createETF({ symbol: "XLP",   name: "Consumer Staples Select Sector SPDR",     yahooSymbol: "XLP",   tradingViewSymbol: "AMEX:XLP" }),
  createETF({ symbol: "XLB",   name: "Materials Select Sector SPDR Fund",       yahooSymbol: "XLB",   tradingViewSymbol: "AMEX:XLB" }),
  createETF({ symbol: "XLU",   name: "Utilities Select Sector SPDR Fund",       yahooSymbol: "XLU",   tradingViewSymbol: "AMEX:XLU" }),
  createETF({ symbol: "XLRE",  name: "Real Estate Select Sector SPDR Fund",     yahooSymbol: "XLRE",  tradingViewSymbol: "AMEX:XLRE" }),
  createETF({ symbol: "XLC",   name: "Communication Services Select Sector SPDR", yahooSymbol: "XLC", tradingViewSymbol: "AMEX:XLC" }),

  // ─── ETFs: THEMATIC & SPECIALTY (12 total) ─────────────────────────────────
  createETF({ symbol: "IBB",   name: "iShares Biotechnology ETF",               yahooSymbol: "IBB",   tradingViewSymbol: "NASDAQ:IBB" }),
  createETF({ symbol: "SOXX",  name: "iShares Semiconductor ETF",               yahooSymbol: "SOXX",  tradingViewSymbol: "NASDAQ:SOXX" }),
  createETF({ symbol: "KBWB",  name: "Invesco KBW Bank ETF",                    yahooSymbol: "KBWB",  tradingViewSymbol: "NASDAQ:KBWB" }),
  createETF({ symbol: "GDX",   name: "VanEck Gold Miners ETF",                  yahooSymbol: "GDX",   tradingViewSymbol: "AMEX:GDX" }),
  createETF({ symbol: "GDXJ",  name: "VanEck Junior Gold Miners ETF",           yahooSymbol: "GDXJ",  tradingViewSymbol: "AMEX:GDXJ" }),
  createETF({ symbol: "XOP",   name: "SPDR S&P Oil & Gas Exploration ETF",      yahooSymbol: "XOP",   tradingViewSymbol: "AMEX:XOP" }),
  createETF({ symbol: "HACK",  name: "ETFMG Prime Cyber Security ETF",          yahooSymbol: "HACK",  tradingViewSymbol: "AMEX:HACK" }),
  createETF({ symbol: "SKYY",  name: "First Trust Cloud Computing ETF",         yahooSymbol: "SKYY",  tradingViewSymbol: "NASDAQ:SKYY" }),
  createETF({ symbol: "BOTZ",  name: "Global X Robotics & AI ETF",              yahooSymbol: "BOTZ",  tradingViewSymbol: "NASDAQ:BOTZ" }),
  createETF({ symbol: "FINX",  name: "Global X FinTech ETF",                    yahooSymbol: "FINX",  tradingViewSymbol: "NASDAQ:FINX" }),
  createETF({ symbol: "AIQ",   name: "Global X Artificial Intelligence ETF",    yahooSymbol: "AIQ",   tradingViewSymbol: "NASDAQ:AIQ" }),
  createETF({ symbol: "ROBO",  name: "ROBO Global Robotics & Automation ETF",   yahooSymbol: "ROBO",  tradingViewSymbol: "NASDAQ:ROBO" }),

  // ─── ETFs: INTERNATIONAL (16 total) ────────────────────────────────────────
  createETF({ symbol: "IJR",   name: "iShares Core S&P Small-Cap ETF",          yahooSymbol: "IJR",   tradingViewSymbol: "AMEX:IJR" }),
  createETF({ symbol: "VEU",   name: "Vanguard FTSE All-World ex-US ETF",       yahooSymbol: "VEU",   tradingViewSymbol: "AMEX:VEU" }),
  createETF({ symbol: "VT",    name: "Vanguard Total World Stock ETF",          yahooSymbol: "VT",    tradingViewSymbol: "AMEX:VT" }),
  createETF({ symbol: "MCHI",  name: "iShares MSCI China ETF",                  yahooSymbol: "MCHI",  tradingViewSymbol: "NASDAQ:MCHI" }),
  createETF({ symbol: "EWZ",   name: "iShares MSCI Brazil ETF",                 yahooSymbol: "EWZ",   tradingViewSymbol: "AMEX:EWZ" }),
  createETF({ symbol: "EWC",   name: "iShares MSCI Canada ETF",                 yahooSymbol: "EWC",   tradingViewSymbol: "AMEX:EWC" }),
  createETF({ symbol: "EWT",   name: "iShares MSCI Taiwan ETF",                 yahooSymbol: "EWT",   tradingViewSymbol: "AMEX:EWT" }),
  createETF({ symbol: "EWY",   name: "iShares MSCI South Korea ETF",            yahooSymbol: "EWY",   tradingViewSymbol: "AMEX:EWY" }),
  createETF({ symbol: "EWA",   name: "iShares MSCI Australia ETF",              yahooSymbol: "EWA",   tradingViewSymbol: "AMEX:EWA" }),
  createETF({ symbol: "EWI",   name: "iShares MSCI Italy ETF",                  yahooSymbol: "EWI",   tradingViewSymbol: "AMEX:EWI" }),
  createETF({ symbol: "EWP",   name: "iShares MSCI Spain ETF",                  yahooSymbol: "EWP",   tradingViewSymbol: "AMEX:EWP" }),
  createETF({ symbol: "EWQ",   name: "iShares MSCI France ETF",                 yahooSymbol: "EWQ",   tradingViewSymbol: "AMEX:EWQ" }),
  createETF({ symbol: "VGK",   name: "Vanguard FTSE Europe ETF",                yahooSymbol: "VGK",   tradingViewSymbol: "AMEX:VGK" }),
  createETF({ symbol: "VPL",   name: "Vanguard FTSE Pacific ETF",               yahooSymbol: "VPL",   tradingViewSymbol: "AMEX:VPL" }),
  createETF({ symbol: "ACWI",  name: "iShares MSCI ACWI ETF",                   yahooSymbol: "ACWI",  tradingViewSymbol: "NASDAQ:ACWI" }),
  createETF({ symbol: "IEUR",  name: "iShares Core MSCI Europe ETF",            yahooSymbol: "IEUR",  tradingViewSymbol: "AMEX:IEUR" }),

  // ─── ASSET UNIVERSE EXPANSION — BATCH 1: ETFs (103, live-verified via Yahoo) ───
  createETF({ symbol: "SPYG", name: "SPDR Portfolio S&P 500 Growth ETF", yahooSymbol: "SPYG" }),
  createETF({ symbol: "SPYV", name: "SPDR Portfolio S&P 500 Value ETF", yahooSymbol: "SPYV" }),
  createETF({ symbol: "SPYD", name: "SPDR Portfolio S&P 500 High Dividend ETF", yahooSymbol: "SPYD" }),
  createETF({ symbol: "MDY", name: "SPDR S&P MidCap 400 ETF", yahooSymbol: "MDY" }),
  createETF({ symbol: "IJH", name: "iShares Core S&P Mid-Cap ETF", yahooSymbol: "IJH" }),
  createETF({ symbol: "IWD", name: "iShares Russell 1000 Value ETF", yahooSymbol: "IWD" }),
  createETF({ symbol: "IWF", name: "iShares Russell 1000 Growth ETF", yahooSymbol: "IWF" }),
  createETF({ symbol: "IWN", name: "iShares Russell 2000 Value ETF", yahooSymbol: "IWN" }),
  createETF({ symbol: "IWO", name: "iShares Russell 2000 Growth ETF", yahooSymbol: "IWO" }),
  createETF({ symbol: "IWB", name: "iShares Russell 1000 ETF", yahooSymbol: "IWB" }),
  createETF({ symbol: "IWV", name: "iShares Russell 3000 ETF", yahooSymbol: "IWV" }),
  createETF({ symbol: "VTV", name: "Vanguard Value ETF", yahooSymbol: "VTV" }),
  createETF({ symbol: "VUG", name: "Vanguard Growth ETF", yahooSymbol: "VUG" }),
  createETF({ symbol: "VBR", name: "Vanguard Small-Cap Value ETF", yahooSymbol: "VBR" }),
  createETF({ symbol: "VBK", name: "Vanguard Small-Cap Growth ETF", yahooSymbol: "VBK" }),
  createETF({ symbol: "VB", name: "Vanguard Small-Cap ETF", yahooSymbol: "VB" }),
  createETF({ symbol: "VO", name: "Vanguard Mid-Cap ETF", yahooSymbol: "VO" }),
  createETF({ symbol: "MGK", name: "Vanguard Mega Cap Growth ETF", yahooSymbol: "MGK" }),
  createETF({ symbol: "OEF", name: "iShares S&P 100 ETF", yahooSymbol: "OEF" }),
  createETF({ symbol: "EFA", name: "iShares MSCI EAFE ETF", yahooSymbol: "EFA" }),
  createETF({ symbol: "ACWX", name: "iShares MSCI ACWI ex U.S. ETF", yahooSymbol: "ACWX" }),
  createETF({ symbol: "IXUS", name: "iShares Core MSCI Total International Stock ETF", yahooSymbol: "IXUS" }),
  createETF({ symbol: "SCHF", name: "Schwab International Equity ETF", yahooSymbol: "SCHF" }),
  createETF({ symbol: "SCHX", name: "Schwab U.S. Large-Cap ETF", yahooSymbol: "SCHX" }),
  createETF({ symbol: "SDY", name: "SPDR S&P Dividend ETF", yahooSymbol: "SDY" }),
  createETF({ symbol: "DVY", name: "iShares Select Dividend ETF", yahooSymbol: "DVY" }),
  createETF({ symbol: "NOBL", name: "ProShares S&P 500 Dividend Aristocrats ETF", yahooSymbol: "NOBL" }),
  createETF({ symbol: "USMV", name: "iShares MSCI USA Min Vol Factor ETF", yahooSymbol: "USMV" }),
  createETF({ symbol: "SPLV", name: "Invesco S&P 500 Low Volatility ETF", yahooSymbol: "SPLV" }),
  createETF({ symbol: "QUAL", name: "iShares MSCI USA Quality Factor ETF", yahooSymbol: "QUAL" }),
  createETF({ symbol: "MTUM", name: "iShares MSCI USA Momentum Factor ETF", yahooSymbol: "MTUM" }),
  createETF({ symbol: "VLUE", name: "iShares MSCI USA Value Factor ETF", yahooSymbol: "VLUE" }),
  createETF({ symbol: "COWZ", name: "Pacer US Cash Cows 100 ETF", yahooSymbol: "COWZ" }),
  createETF({ symbol: "PFF", name: "iShares Preferred and Income Securities ETF", yahooSymbol: "PFF" }),
  createETF({ symbol: "BIV", name: "Vanguard Intermediate-Term Bond ETF", yahooSymbol: "BIV" }),
  createETF({ symbol: "BSV", name: "Vanguard Short-Term Bond ETF", yahooSymbol: "BSV" }),
  createETF({ symbol: "BLV", name: "Vanguard Long-Term Bond ETF", yahooSymbol: "BLV" }),
  createETF({ symbol: "MUB", name: "iShares National Muni Bond ETF", yahooSymbol: "MUB" }),
  createETF({ symbol: "VTEB", name: "Vanguard Tax-Exempt Bond ETF", yahooSymbol: "VTEB" }),
  createETF({ symbol: "EMB", name: "iShares J.P. Morgan USD Emerging Markets Bond ETF", yahooSymbol: "EMB" }),
  createETF({ symbol: "BNDX", name: "Vanguard Total International Bond ETF", yahooSymbol: "BNDX" }),
  createETF({ symbol: "IGSB", name: "iShares 1-5 Year Investment Grade Corporate Bond ETF", yahooSymbol: "IGSB" }),
  createETF({ symbol: "IGLB", name: "iShares 10+ Year Investment Grade Corporate Bond ETF", yahooSymbol: "IGLB" }),
  createETF({ symbol: "SHV", name: "iShares Short Treasury Bond ETF", yahooSymbol: "SHV" }),
  createETF({ symbol: "GOVT", name: "iShares U.S. Treasury Bond ETF", yahooSymbol: "GOVT" }),
  createETF({ symbol: "SCHP", name: "Schwab U.S. TIPS ETF", yahooSymbol: "SCHP" }),
  createETF({ symbol: "VTIP", name: "Vanguard Short-Term Inflation-Protected Securities ETF", yahooSymbol: "VTIP" }),
  createETF({ symbol: "ICLN", name: "iShares Global Clean Energy ETF", yahooSymbol: "ICLN" }),
  createETF({ symbol: "TAN", name: "Invesco Solar ETF", yahooSymbol: "TAN" }),
  createETF({ symbol: "XLG", name: "Invesco S&P 500 Top 50 ETF", yahooSymbol: "XLG" }),
  createETF({ symbol: "IYW", name: "iShares U.S. Technology ETF", yahooSymbol: "IYW" }),
  createETF({ symbol: "IYF", name: "iShares U.S. Financials ETF", yahooSymbol: "IYF" }),
  createETF({ symbol: "VFH", name: "Vanguard Financials ETF", yahooSymbol: "VFH" }),
  createETF({ symbol: "IYR", name: "iShares U.S. Real Estate ETF", yahooSymbol: "IYR" }),
  createETF({ symbol: "IYE", name: "iShares U.S. Energy ETF", yahooSymbol: "IYE" }),
  createETF({ symbol: "XME", name: "SPDR S&P Metals and Mining ETF", yahooSymbol: "XME" }),
  createETF({ symbol: "SIL", name: "Global X Silver Miners ETF", yahooSymbol: "SIL" }),
  createETF({ symbol: "COPX", name: "Global X Copper Miners ETF", yahooSymbol: "COPX" }),
  createETF({ symbol: "JNK", name: "SPDR Bloomberg High Yield Bond ETF", yahooSymbol: "JNK" }),
  createETF({ symbol: "ANGL", name: "VanEck Fallen Angel High Yield Bond ETF", yahooSymbol: "ANGL" }),
  createETF({ symbol: "EMLC", name: "VanEck J.P. Morgan EM Local Currency Bond ETF", yahooSymbol: "EMLC" }),
  createETF({ symbol: "FXI", name: "iShares China Large-Cap ETF", yahooSymbol: "FXI" }),
  createETF({ symbol: "ASHR", name: "Xtrackers Harvest CSI 300 China A-Shares ETF", yahooSymbol: "ASHR" }),
  createETF({ symbol: "KWEB", name: "KraneShares CSI China Internet ETF", yahooSymbol: "KWEB" }),
  createETF({ symbol: "INDA", name: "iShares MSCI India ETF", yahooSymbol: "INDA" }),
  createETF({ symbol: "EWS", name: "iShares MSCI Singapore ETF", yahooSymbol: "EWS" }),
  createETF({ symbol: "EWM", name: "iShares MSCI Malaysia ETF", yahooSymbol: "EWM" }),
  createETF({ symbol: "THD", name: "iShares MSCI Thailand ETF", yahooSymbol: "THD" }),
  createETF({ symbol: "EIDO", name: "iShares MSCI Indonesia ETF", yahooSymbol: "EIDO" }),
  createETF({ symbol: "EZA", name: "iShares MSCI South Africa ETF", yahooSymbol: "EZA" }),
  createETF({ symbol: "RSX", name: "VanEck Russia ETF", yahooSymbol: "RSX" }),
  createETF({ symbol: "ARGT", name: "Global X MSCI Argentina ETF", yahooSymbol: "ARGT" }),
  createETF({ symbol: "EPI", name: "WisdomTree India Earnings Fund", yahooSymbol: "EPI" }),
  createETF({ symbol: "EWD", name: "iShares MSCI Sweden ETF", yahooSymbol: "EWD" }),
  createETF({ symbol: "EWN", name: "iShares MSCI Netherlands ETF", yahooSymbol: "EWN" }),
  createETF({ symbol: "EWL", name: "iShares MSCI Switzerland ETF", yahooSymbol: "EWL" }),
  createETF({ symbol: "EWO", name: "iShares MSCI Austria ETF", yahooSymbol: "EWO" }),
  createETF({ symbol: "GREK", name: "Global X MSCI Greece ETF", yahooSymbol: "GREK" }),
  createETF({ symbol: "EWK", name: "iShares MSCI Belgium ETF", yahooSymbol: "EWK" }),
  createETF({ symbol: "PALL", name: "abrdn Physical Palladium Shares ETF", yahooSymbol: "PALL" }),
  createETF({ symbol: "PPLT", name: "abrdn Physical Platinum Shares ETF", yahooSymbol: "PPLT" }),
  createETF({ symbol: "URA", name: "Global X Uranium ETF", yahooSymbol: "URA" }),
  createETF({ symbol: "LIT", name: "Global X Lithium & Battery Tech ETF", yahooSymbol: "LIT" }),
  createETF({ symbol: "REMX", name: "VanEck Rare Earth/Strategic Metals ETF", yahooSymbol: "REMX" }),
  createETF({ symbol: "WOOD", name: "iShares Global Timber & Forestry ETF", yahooSymbol: "WOOD" }),
  createETF({ symbol: "MOO", name: "VanEck Agribusiness ETF", yahooSymbol: "MOO" }),
  createETF({ symbol: "VAW", name: "Vanguard Materials ETF", yahooSymbol: "VAW" }),
  createETF({ symbol: "VHT", name: "Vanguard Health Care ETF", yahooSymbol: "VHT" }),
  createETF({ symbol: "VGT", name: "Vanguard Information Technology ETF", yahooSymbol: "VGT" }),
  createETF({ symbol: "VDC", name: "Vanguard Consumer Staples ETF", yahooSymbol: "VDC" }),
  createETF({ symbol: "VCR", name: "Vanguard Consumer Discretionary ETF", yahooSymbol: "VCR" }),
  createETF({ symbol: "VIS", name: "Vanguard Industrials ETF", yahooSymbol: "VIS" }),
  createETF({ symbol: "VPU", name: "Vanguard Utilities ETF", yahooSymbol: "VPU" }),
  createETF({ symbol: "VDE", name: "Vanguard Energy ETF", yahooSymbol: "VDE" }),
  createETF({ symbol: "VOX", name: "Vanguard Communication Services ETF", yahooSymbol: "VOX" }),
  createETF({ symbol: "VNQI", name: "Vanguard Global ex-U.S. Real Estate ETF", yahooSymbol: "VNQI" }),
  createETF({ symbol: "REET", name: "iShares Global REIT ETF", yahooSymbol: "REET" }),
  createETF({ symbol: "PDBC", name: "Invesco Optimum Yield Diversified Commodity Strategy ETF", yahooSymbol: "PDBC" }),
  createETF({ symbol: "GSG", name: "iShares S&P GSCI Commodity-Indexed Trust", yahooSymbol: "GSG" }),
  createETF({ symbol: "BITO", name: "ProShares Bitcoin Strategy ETF", yahooSymbol: "BITO" }),
  createETF({ symbol: "IBIT", name: "iShares Bitcoin Trust", yahooSymbol: "IBIT" }),
  createETF({ symbol: "FBTC", name: "Fidelity Wise Origin Bitcoin Fund", yahooSymbol: "FBTC" }),
  createETF({ symbol: "ETHA", name: "iShares Ethereum Trust", yahooSymbol: "ETHA" }),

  // ─── ASSET UNIVERSE EXPANSION — BATCH 6: ETFs (72, live-verified via Yahoo) ───
  createETF({ symbol: "VOOG", name: "Vanguard S&P 500 Growth ETF", yahooSymbol: "VOOG" }),
  createETF({ symbol: "VOOV", name: "Vanguard S&P 500 Value ETF", yahooSymbol: "VOOV" }),
  createETF({ symbol: "IUSG", name: "iShares Core S&P U.S. Growth ETF", yahooSymbol: "IUSG" }),
  createETF({ symbol: "IUSV", name: "iShares Core S&P U.S. Value ETF", yahooSymbol: "IUSV" }),
  createETF({ symbol: "SCHK", name: "Schwab 1000 Index ETF", yahooSymbol: "SCHK" }),
  createETF({ symbol: "ITOT", name: "iShares Core S&P Total U.S. Stock Market ETF", yahooSymbol: "ITOT" }),
  createETF({ symbol: "VV", name: "Vanguard Large-Cap ETF", yahooSymbol: "VV" }),
  createETF({ symbol: "MGC", name: "Vanguard Mega Cap ETF", yahooSymbol: "MGC" }),
  createETF({ symbol: "SPMD", name: "SPDR Portfolio S&P 400 Mid Cap ETF", yahooSymbol: "SPMD" }),
  createETF({ symbol: "SPSM", name: "SPDR Portfolio S&P 600 Small Cap ETF", yahooSymbol: "SPSM" }),
  createETF({ symbol: "AVUV", name: "Avantis U.S. Small Cap Value ETF", yahooSymbol: "AVUV" }),
  createETF({ symbol: "DFAC", name: "Dimensional U.S. Core Equity 2 ETF", yahooSymbol: "DFAC" }),
  createETF({ symbol: "DGRW", name: "WisdomTree U.S. Quality Dividend Growth Fund", yahooSymbol: "DGRW" }),
  createETF({ symbol: "FNDX", name: "Schwab Fundamental U.S. Large Company ETF", yahooSymbol: "FNDX" }),
  createETF({ symbol: "RDVY", name: "First Trust Rising Dividend Achievers ETF", yahooSymbol: "RDVY" }),
  createETF({ symbol: "FDVV", name: "Fidelity High Dividend ETF", yahooSymbol: "FDVV" }),
  createETF({ symbol: "SCHY", name: "Schwab International Dividend Equity ETF", yahooSymbol: "SCHY" }),
  createETF({ symbol: "IDV", name: "iShares International Select Dividend ETF", yahooSymbol: "IDV" }),
  createETF({ symbol: "HDEF", name: "Xtrackers MSCI EAFE High Dividend Yield Equity ETF", yahooSymbol: "HDEF" }),
  createETF({ symbol: "PEY", name: "Invesco High Yield Equity Dividend Achievers ETF", yahooSymbol: "PEY" }),
  createETF({ symbol: "FDL", name: "First Trust Morningstar Dividend Leaders Index Fund", yahooSymbol: "FDL" }),
  createETF({ symbol: "DON", name: "WisdomTree U.S. MidCap Dividend Fund", yahooSymbol: "DON" }),
  createETF({ symbol: "DES", name: "WisdomTree U.S. SmallCap Dividend Fund", yahooSymbol: "DES" }),
  createETF({ symbol: "EFAD", name: "ProShares MSCI EAFE Dividend Growers ETF", yahooSymbol: "EFAD" }),
  createETF({ symbol: "PGX", name: "Invesco Preferred ETF", yahooSymbol: "PGX" }),
  createETF({ symbol: "PFFD", name: "Global X U.S. Preferred ETF", yahooSymbol: "PFFD" }),
  createETF({ symbol: "FPE", name: "First Trust Preferred Securities and Income ETF", yahooSymbol: "FPE" }),
  createETF({ symbol: "SRLN", name: "SPDR Blackstone Senior Loan ETF", yahooSymbol: "SRLN" }),
  createETF({ symbol: "BKLN", name: "Invesco Senior Loan ETF", yahooSymbol: "BKLN" }),
  createETF({ symbol: "FLOT", name: "iShares Floating Rate Bond ETF", yahooSymbol: "FLOT" }),
  createETF({ symbol: "MINT", name: "PIMCO Enhanced Short Maturity Active ETF", yahooSymbol: "MINT" }),
  createETF({ symbol: "JPST", name: "JPMorgan Ultra-Short Income ETF", yahooSymbol: "JPST" }),
  createETF({ symbol: "SGOV", name: "iShares 0-3 Month Treasury Bond ETF", yahooSymbol: "SGOV" }),
  createETF({ symbol: "USFR", name: "WisdomTree Floating Rate Treasury Fund", yahooSymbol: "USFR" }),
  createETF({ symbol: "TFLO", name: "iShares Treasury Floating Rate Bond ETF", yahooSymbol: "TFLO" }),
  createETF({ symbol: "SPTL", name: "SPDR Portfolio Long Term Treasury ETF", yahooSymbol: "SPTL" }),
  createETF({ symbol: "SPTI", name: "SPDR Portfolio Intermediate Term Treasury ETF", yahooSymbol: "SPTI" }),
  createETF({ symbol: "SPTS", name: "SPDR Portfolio Short Term Treasury ETF", yahooSymbol: "SPTS" }),
  createETF({ symbol: "STIP", name: "iShares 0-5 Year TIPS Bond ETF", yahooSymbol: "STIP" }),
  createETF({ symbol: "LQDH", name: "iShares Interest Rate Hedged Corporate Bond ETF", yahooSymbol: "LQDH" }),
  createETF({ symbol: "USIG", name: "iShares Broad USD Investment Grade Corporate Bond ETF", yahooSymbol: "USIG" }),
  createETF({ symbol: "VCLT", name: "Vanguard Long-Term Corporate Bond ETF", yahooSymbol: "VCLT" }),
  createETF({ symbol: "SPHY", name: "SPDR Portfolio High Yield Bond ETF", yahooSymbol: "SPHY" }),
  createETF({ symbol: "USHY", name: "iShares Broad USD High Yield Corporate Bond ETF", yahooSymbol: "USHY" }),
  createETF({ symbol: "PGHY", name: "Invesco Global Short Term High Yield Bond ETF", yahooSymbol: "PGHY" }),
  createETF({ symbol: "SHYG", name: "iShares 0-5 Year High Yield Corporate Bond ETF", yahooSymbol: "SHYG" }),
  createETF({ symbol: "EMHY", name: "iShares Emerging Markets High Yield Bond ETF", yahooSymbol: "EMHY" }),
  createETF({ symbol: "PCY", name: "Invesco Emerging Markets Sovereign Debt ETF", yahooSymbol: "PCY" }),
  createETF({ symbol: "CWB", name: "SPDR Bloomberg Convertible Securities ETF", yahooSymbol: "CWB" }),
  createETF({ symbol: "ICVT", name: "iShares Convertible Bond ETF", yahooSymbol: "ICVT" }),
  createETF({ symbol: "SMIN", name: "iShares MSCI India Small-Cap ETF", yahooSymbol: "SMIN" }),
  createETF({ symbol: "EWX", name: "SPDR S&P Emerging Markets Small Cap ETF", yahooSymbol: "EWX" }),
  createETF({ symbol: "DGS", name: "WisdomTree Emerging Markets SmallCap Dividend Fund", yahooSymbol: "DGS" }),
  createETF({ symbol: "FM", name: "iShares MSCI Frontier and Select EM ETF", yahooSymbol: "FM" }),
  createETF({ symbol: "VNM", name: "VanEck Vietnam ETF", yahooSymbol: "VNM" }),
  createETF({ symbol: "EPHE", name: "iShares MSCI Philippines ETF", yahooSymbol: "EPHE" }),
  createETF({ symbol: "TUR", name: "iShares MSCI Turkey ETF", yahooSymbol: "TUR" }),
  createETF({ symbol: "EWW", name: "iShares MSCI Mexico ETF", yahooSymbol: "EWW" }),
  createETF({ symbol: "ECH", name: "iShares MSCI Chile ETF", yahooSymbol: "ECH" }),
  createETF({ symbol: "ENZL", name: "iShares MSCI New Zealand ETF", yahooSymbol: "ENZL" }),
  createETF({ symbol: "EDEN", name: "iShares MSCI Denmark ETF", yahooSymbol: "EDEN" }),
  createETF({ symbol: "EFNL", name: "iShares MSCI Finland ETF", yahooSymbol: "EFNL" }),
  createETF({ symbol: "EIS", name: "iShares MSCI Israel ETF", yahooSymbol: "EIS" }),
  createETF({ symbol: "QAT", name: "iShares MSCI Qatar ETF", yahooSymbol: "QAT" }),
  createETF({ symbol: "UAE", name: "iShares MSCI UAE ETF", yahooSymbol: "UAE" }),
  createETF({ symbol: "KSA", name: "iShares MSCI Saudi Arabia ETF", yahooSymbol: "KSA" }),
  createETF({ symbol: "EWZS", name: "iShares MSCI Brazil Small-Cap ETF", yahooSymbol: "EWZS" }),
  createETF({ symbol: "ILF", name: "iShares Latin America 40 ETF", yahooSymbol: "ILF" }),
  createETF({ symbol: "FXB", name: "Invesco CurrencyShares British Pound Sterling Trust", yahooSymbol: "FXB" }),
  createETF({ symbol: "FXE", name: "Invesco CurrencyShares Euro Trust", yahooSymbol: "FXE" }),
  createETF({ symbol: "FXY", name: "Invesco CurrencyShares Japanese Yen Trust", yahooSymbol: "FXY" }),
  createETF({ symbol: "UUP", name: "Invesco DB US Dollar Index Bullish Fund", yahooSymbol: "UUP" }),

  // ─── GLOBAL INDICES EXPANDED (14 total) ────────────────────────────────────
  createIndex({ symbol: "CAC40",    name: "CAC 40 (France)",               yahooSymbol: "^FCHI",    tradingViewSymbol: "EURONEXT:CAC40" }),
  createIndex({ symbol: "IBEX35",   name: "IBEX 35 (Spain)",               yahooSymbol: "^IBEX",    tradingViewSymbol: "BME:IBEX" }),
  createIndex({ symbol: "SMI",      name: "SMI Swiss Market Index",        yahooSymbol: "^SSMI",    tradingViewSymbol: "TVC:SMI" }),
  createIndex({ symbol: "AEX",      name: "AEX (Netherlands)",             yahooSymbol: "^AEX",     tradingViewSymbol: "TVC:AEX" }),
  createIndex({ symbol: "HSI",      name: "Hang Seng Index (Hong Kong)",   yahooSymbol: "^HSI",     tradingViewSymbol: "TVC:HSI" }),
  createIndex({ symbol: "KOSPI",    name: "KOSPI (South Korea)",           yahooSymbol: "^KS11",    tradingViewSymbol: "KRX:KOSPI" }),
  createIndex({ symbol: "SENSEX",   name: "BSE SENSEX (India)",            yahooSymbol: "^BSESN",   tradingViewSymbol: "BSE:SENSEX" }),
  createIndex({ symbol: "ASX200",   name: "S&P/ASX 200 (Australia)",       yahooSymbol: "^AXJO",    tradingViewSymbol: "ASX:XJO" }),
  createIndex({ symbol: "TSX",      name: "S&P/TSX Composite (Canada)",    yahooSymbol: "^GSPTSE",  tradingViewSymbol: "TVC:TSX" }),
  createIndex({ symbol: "IBOVESPA", name: "Bovespa Index (Brazil)",        yahooSymbol: "^BVSP",    tradingViewSymbol: "BMFBOVESPA:IBOV" }),
  createIndex({ symbol: "STOXX50",  name: "Euro Stoxx 50",                 yahooSymbol: "^STOXX50E",tradingViewSymbol: "TVC:SX5E" }),
  createIndex({ symbol: "NIFTY50",  name: "NIFTY 50 (India)",              yahooSymbol: "^NSEI",    tradingViewSymbol: "NSE:NIFTY" }),
  createIndex({ symbol: "TWII",     name: "Taiwan Weighted Index",         yahooSymbol: "^TWII",    tradingViewSymbol: "TWSE:Y9999" }),
  createIndex({ symbol: "STI",      name: "Straits Times Index (Singapore)",yahooSymbol: "^STI",     tradingViewSymbol: "SGX:STI" }),

  // ─── CRYPTO EXPANDED (12 total) ────────────────────────────────────────────
  createCrypto({ symbol: "AAVEUSD",  name: "Aave",           yahooSymbol: "AAVE-USD",  tradingViewSymbol: "BINANCE:AAVEUSDT" }),
  createCrypto({ symbol: "NEARUSD",  name: "NEAR Protocol",  yahooSymbol: "NEAR-USD",  tradingViewSymbol: "BINANCE:NEARUSDT" }),
  createCrypto({ symbol: "SANDUSD",  name: "The Sandbox",    yahooSymbol: "SAND-USD",  tradingViewSymbol: "BINANCE:SANDUSDT" }),
  createCrypto({ symbol: "MANAUSD",  name: "Decentraland",   yahooSymbol: "MANA-USD",  tradingViewSymbol: "BINANCE:MANAUSDT" }),
  createCrypto({ symbol: "ARBUSD",   name: "Arbitrum",       yahooSymbol: "ARB-USD",   tradingViewSymbol: "BINANCE:ARBUSDT" }),
  createCrypto({ symbol: "OPUSD",    name: "Optimism",       yahooSymbol: "OP-USD",    tradingViewSymbol: "BINANCE:OPUSDT" }),
  createCrypto({ symbol: "RNDRUSD",  name: "Render",         yahooSymbol: "RNDR-USD",  tradingViewSymbol: "BINANCE:RNDRUSDT" }),
  createCrypto({ symbol: "LDOUSD",   name: "Lido DAO",       yahooSymbol: "LDO-USD",   tradingViewSymbol: "BINANCE:LDOUSDT" }),
  createCrypto({ symbol: "INJUSD",   name: "Injective",      yahooSymbol: "INJ-USD",   tradingViewSymbol: "BINANCE:INJUSDT" }),
  createCrypto({ symbol: "SUIUSD",   name: "Sui",            yahooSymbol: "SUI-USD",   tradingViewSymbol: "BINANCE:SUIUSDT" }),
  createCrypto({ symbol: "STXUSD",   name: "Stacks",         yahooSymbol: "STX-USD",   tradingViewSymbol: "BINANCE:STXUSDT" }),
  createCrypto({ symbol: "GALAUSD",  name: "Gala",           yahooSymbol: "GALA-USD",  tradingViewSymbol: "BINANCE:GALAUSDT" }),

  // ─── ASSET UNIVERSE EXPANSION — BATCH 4: crypto (25, live-verified via Yahoo, name-collision checked) ───
  createCrypto({ symbol: "ALGOUSD", name: "Algorand", yahooSymbol: "ALGO-USD" }),
  createCrypto({ symbol: "XLMUSD", name: "Stellar", yahooSymbol: "XLM-USD" }),
  createCrypto({ symbol: "ICPUSD", name: "Internet Computer", yahooSymbol: "ICP-USD" }),
  createCrypto({ symbol: "ETCUSD", name: "Ethereum Classic", yahooSymbol: "ETC-USD" }),
  createCrypto({ symbol: "FLOWUSD", name: "Flow", yahooSymbol: "FLOW-USD" }),
  createCrypto({ symbol: "XTZUSD", name: "Tezos", yahooSymbol: "XTZ-USD" }),
  createCrypto({ symbol: "CROUSD", name: "Cronos", yahooSymbol: "CRO-USD", tradingViewSymbol: "" }),
  createCrypto({ symbol: "QNTUSD", name: "Quant", yahooSymbol: "QNT-USD" }),
  createCrypto({ symbol: "RUNEUSD", name: "THORChain", yahooSymbol: "RUNE-USD" }),
  createCrypto({ symbol: "KAVAUSD", name: "Kava", yahooSymbol: "KAVA-USD" }),
  createCrypto({ symbol: "FETUSD", name: "Artificial Superintelligence Alliance", yahooSymbol: "FET-USD" }),
  createCrypto({ symbol: "ARUSD", name: "Arweave", yahooSymbol: "AR-USD" }),
  createCrypto({ symbol: "KASUSD", name: "Kaspa", yahooSymbol: "KAS-USD", tradingViewSymbol: "" }),
  createCrypto({ symbol: "SHIBUSD", name: "Shiba Inu", yahooSymbol: "SHIB-USD" }),
  createCrypto({ symbol: "WLDUSD", name: "Worldcoin", yahooSymbol: "WLD-USD" }),
  createCrypto({ symbol: "TONUSD", name: "Toncoin", yahooSymbol: "TON11419-USD" }),
  createCrypto({ symbol: "JUPUSD", name: "Jupiter", yahooSymbol: "JUP-USD" }),
  createCrypto({ symbol: "PYTHUSD", name: "Pyth Network", yahooSymbol: "PYTH-USD" }),
  createCrypto({ symbol: "TIAUSD", name: "Celestia", yahooSymbol: "TIA-USD" }),
  createCrypto({ symbol: "SEIUSD", name: "Sei", yahooSymbol: "SEI-USD" }),
  createCrypto({ symbol: "ENAUSD", name: "Ethena", yahooSymbol: "ENA-USD" }),
  createCrypto({ symbol: "ONDOUSD", name: "Ondo", yahooSymbol: "ONDO-USD" }),
  createCrypto({ symbol: "BONKUSD", name: "Bonk", yahooSymbol: "BONK-USD" }),
  createCrypto({ symbol: "FLOKIUSD", name: "Floki", yahooSymbol: "FLOKI-USD" }),
  createCrypto({ symbol: "WIFUSD", name: "dogwifhat", yahooSymbol: "WIF-USD" }),

  // ─── FOREX CROSS PAIRS EXPANDED (14 total) ─────────────────────────────────
  createForex({ symbol: "GBPJPY",  name: "British Pound / Japanese Yen",    yahooSymbol: "GBPJPY=X",  tradingViewSymbol: "FX:GBPJPY" }),
  createForex({ symbol: "GBPCHF",  name: "British Pound / Swiss Franc",     yahooSymbol: "GBPCHF=X",  tradingViewSymbol: "FX:GBPCHF" }),
  createForex({ symbol: "GBPAUD",  name: "British Pound / Australian Dollar",yahooSymbol: "GBPAUD=X",  tradingViewSymbol: "FX:GBPAUD" }),
  createForex({ symbol: "GBPNZD",  name: "British Pound / New Zealand Dollar",yahooSymbol: "GBPNZD=X", tradingViewSymbol: "FX:GBPNZD" }),
  createForex({ symbol: "EURCHF",  name: "Euro / Swiss Franc",               yahooSymbol: "EURCHF=X",  tradingViewSymbol: "FX:EURCHF" }),
  createForex({ symbol: "EURAUD",  name: "Euro / Australian Dollar",         yahooSymbol: "EURAUD=X",  tradingViewSymbol: "FX:EURAUD" }),
  createForex({ symbol: "EURCAD",  name: "Euro / Canadian Dollar",           yahooSymbol: "EURCAD=X",  tradingViewSymbol: "FX:EURCAD" }),
  createForex({ symbol: "EURNZD",  name: "Euro / New Zealand Dollar",        yahooSymbol: "EURNZD=X",  tradingViewSymbol: "FX:EURNZD" }),
  createForex({ symbol: "EURGBP",  name: "Euro / British Pound",             yahooSymbol: "EURGBP=X",  tradingViewSymbol: "FX:EURGBP" }),
  createForex({ symbol: "USDCHF",  name: "US Dollar / Swiss Franc",          yahooSymbol: "USDCHF=X",  tradingViewSymbol: "FX:USDCHF" }),
  createForex({ symbol: "USDCAD",  name: "US Dollar / Canadian Dollar",      yahooSymbol: "USDCAD=X",  tradingViewSymbol: "FX:USDCAD" }),
  createForex({ symbol: "AUDCAD",  name: "Australian Dollar / Canadian Dollar",yahooSymbol: "AUDCAD=X", tradingViewSymbol: "FX:AUDCAD" }),
  createForex({ symbol: "AUDNZD",  name: "Australian Dollar / New Zealand Dollar",yahooSymbol: "AUDNZD=X",tradingViewSymbol: "FX:AUDNZD" }),
  createForex({ symbol: "CHFJPY",  name: "Swiss Franc / Japanese Yen",       yahooSymbol: "CHFJPY=X",  tradingViewSymbol: "FX:CHFJPY" }),

  // ─── COMMODITIES EXPANDED (6 total) ────────────────────────────────────────
  createCommodity({ symbol: "HEATINGOIL", name: "Heating Oil",   yahooSymbol: "HO=F",  tradingViewSymbol: "NYMEX:HO1!" }),
  createCommodity({ symbol: "RBOB",       name: "RBOB Gasoline", yahooSymbol: "RB=F",  tradingViewSymbol: "NYMEX:RB1!" }),
  createCommodity({ symbol: "COFFEE",     name: "Coffee",        yahooSymbol: "KC=F",  tradingViewSymbol: "ICEUS:KC1!" }),
  createCommodity({ symbol: "COCOA",      name: "Cocoa",         yahooSymbol: "CC=F",  tradingViewSymbol: "ICEUS:CC1!" }),
  createCommodity({ symbol: "COTTON",     name: "Cotton",        yahooSymbol: "CT=F",  tradingViewSymbol: "ICEUS:CT1!" }),
  createCommodity({ symbol: "OATS",       name: "Oats",          yahooSymbol: "ZO=F",  tradingViewSymbol: "CBOT:ZO1!" }),

  // ─── GLOBAL GOVERNMENT BONDS / RATES (12 total) ────────────────────────────
  createBond({ symbol: "DE10Y",  name: "Germany 10Y Bund",      tradingViewSymbol: "TVC:DE10Y" }),
  createBond({ symbol: "DE02Y",  name: "Germany 2Y Schatz",     tradingViewSymbol: "TVC:DE02Y" }),
  createBond({ symbol: "UK10Y",  name: "UK 10Y Gilt",           tradingViewSymbol: "TVC:GB10Y" }),
  createBond({ symbol: "UK02Y",  name: "UK 2Y Gilt",            tradingViewSymbol: "TVC:GB02Y" }),
  createBond({ symbol: "JP10Y",  name: "Japan 10Y JGB",         tradingViewSymbol: "TVC:JP10Y" }),
  createBond({ symbol: "IT10Y",  name: "Italy 10Y BTP",         tradingViewSymbol: "TVC:IT10Y" }),
  createBond({ symbol: "ES10Y",  name: "Spain 10Y Bono",        tradingViewSymbol: "TVC:ES10Y" }),
  createBond({ symbol: "FR10Y",  name: "France 10Y OAT",        tradingViewSymbol: "TVC:FR10Y" }),
  createBond({ symbol: "AU10Y",  name: "Australia 10Y Bond",    tradingViewSymbol: "TVC:AU10Y" }),
  createBond({ symbol: "CA10Y",  name: "Canada 10Y Bond",       tradingViewSymbol: "TVC:CA10Y" }),
  createBond({ symbol: "CN10Y",  name: "China 10Y Bond",        tradingViewSymbol: "TVC:CN10Y" }),
  createBond({ symbol: "BR10Y",  name: "Brazil 10Y Bond",       tradingViewSymbol: "TVC:BR10Y" }),
];

// ─────────────────────────────────────────────────────────────────────────────
// Validation & Utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Validate catalog integrity — checks for duplicates and required fields. */
export function validateCatalog(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const symbols = new Set<string>();
  const yahooSymbols = new Set<string>();

  for (const asset of MARKET_INSTRUMENTS) {
    if (!asset.symbol) errors.push(`Asset missing symbol`);
    if (!asset.name) errors.push(`Asset ${asset.symbol} missing name`);
    if (!asset.category) errors.push(`Asset ${asset.symbol} missing category`);

    if (symbols.has(asset.symbol)) {
      errors.push(`Duplicate symbol: ${asset.symbol}`);
    }
    symbols.add(asset.symbol);

    if (asset.yahooSymbol) {
      if (yahooSymbols.has(asset.yahooSymbol)) {
        errors.push(`Duplicate Yahoo symbol: ${asset.yahooSymbol} (asset: ${asset.symbol})`);
      }
      yahooSymbols.add(asset.yahooSymbol);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getInstrumentsByCategory(category: MarketCategory["id"]): MarketInstrument[] {
  return MARKET_INSTRUMENTS.filter((instrument) => instrument.category === category);
}

/** Usato dalla route `/asset/[symbol]` per risolvere lo strumento dal ticker (case-insensitive). */
export function getInstrumentBySymbol(symbol: string): MarketInstrument | undefined {
  const normalized = symbol.toUpperCase();
  return MARKET_INSTRUMENTS.find((instrument) => instrument.symbol === normalized);
}

/** Get asset count and breakdown by category. */
export function getCatalogStats() {
  const stats: Record<string, number> = {};
  let total = 0;

  for (const cat of MARKET_CATEGORIES) {
    const count = getInstrumentsByCategory(cat.id).length;
    stats[cat.label] = count;
    total += count;
  }

  return { total, byCategory: stats };
}
