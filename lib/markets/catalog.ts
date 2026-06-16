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
    tradingViewSymbol: opts.tradingViewSymbol || `BINANCE:${opts.symbol.replace("USD", "USDT")}`,
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
    tradingViewSymbol: opts.tradingViewSymbol || `TVC:US${opts.symbol.replace("US", "")}Y`,
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
  createIndex({ symbol: "NDX",  name: "Nasdaq 100",                       yahooSymbol: "^NDX", tradingViewSymbol: "NASDAQ:NDX" }),
  createIndex({ symbol: "DJI",  name: "Dow Jones Industrial Average",     yahooSymbol: "^DJI", tradingViewSymbol: "DJ:DJI" }),
  createIndex({ symbol: "RUT",  name: "Russell 2000",                     yahooSymbol: "^RUT", tradingViewSymbol: "TVC:RUT" }),
  createIndex({ symbol: "VIX",  name: "CBOE Volatility Index",            yahooSymbol: "^VIX", tradingViewSymbol: "TVC:VIX" }),
  createIndex({ symbol: "DAX",  name: "DAX Performance Index",            yahooSymbol: "^GDAXI", tradingViewSymbol: "XETR:DAX" }),
  createIndex({ symbol: "FTSE", name: "FTSE 100",                         yahooSymbol: "^FTSE", tradingViewSymbol: "TVC:UKX" }),
  createIndex({ symbol: "N225", name: "Nikkei 225",                       yahooSymbol: "^N225", tradingViewSymbol: "TVC:NI225" }),
  // createIndex({ symbol: "CAC40", name: "CAC 40", yahooSymbol: "^FCHI", tradingViewSymbol: "EURONEXT:PX1" }), // Limited data — disabled

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
  createStock({ symbol: "ORCL",  name: "Oracle Corporation",               yahooSymbol: "ORCL", finnhubSymbol: "ORCL" }),
  createStock({ symbol: "CRM",   name: "Salesforce Inc.",                  yahooSymbol: "CRM", finnhubSymbol: "CRM" }),
  createStock({ symbol: "ADBE",  name: "Adobe Inc.",                       yahooSymbol: "ADBE", finnhubSymbol: "ADBE" }),
  createStock({ symbol: "CSCO",  name: "Cisco Systems Inc.",               yahooSymbol: "CSCO", finnhubSymbol: "CSCO" }),
  createStock({ symbol: "IBM",   name: "International Business Machines",  yahooSymbol: "IBM", finnhubSymbol: "IBM" }),
  createStock({ symbol: "QCOM",  name: "Qualcomm Inc.",                    yahooSymbol: "QCOM", finnhubSymbol: "QCOM" }),
  createStock({ symbol: "TXN",   name: "Texas Instruments Inc.",           yahooSymbol: "TXN", finnhubSymbol: "TXN" }),
  createStock({ symbol: "SHOP",  name: "Shopify Inc.",                     yahooSymbol: "SHOP", finnhubSymbol: "SHOP" }),
  createStock({ symbol: "UBER",  name: "Uber Technologies Inc.",           yahooSymbol: "UBER", finnhubSymbol: "UBER" }),
  createStock({ symbol: "PLTR",  name: "Palantir Technologies Inc.",       yahooSymbol: "PLTR" }),

  // ─── FINANCIAL STOCKS (10 total) ─────────────────────────────────────────
  createStock({ symbol: "JPM",   name: "JPMorgan Chase & Co.",             yahooSymbol: "JPM", finnhubSymbol: "JPM" }),
  createStock({ symbol: "BAC",   name: "Bank of America Corp.",            yahooSymbol: "BAC", finnhubSymbol: "BAC" }),
  createStock({ symbol: "WFC",   name: "Wells Fargo & Co.",                yahooSymbol: "WFC", finnhubSymbol: "WFC" }),
  createStock({ symbol: "GS",    name: "Goldman Sachs Group Inc.",         yahooSymbol: "GS", finnhubSymbol: "GS" }),
  createStock({ symbol: "MS",    name: "Morgan Stanley",                   yahooSymbol: "MS", finnhubSymbol: "MS" }),
  createStock({ symbol: "C",     name: "Citigroup Inc.",                   yahooSymbol: "C", finnhubSymbol: "C" }),
  createStock({ symbol: "V",     name: "Visa Inc.",                        yahooSymbol: "V", finnhubSymbol: "V", tradingViewSymbol: "NYSE:V" }),
  createStock({ symbol: "MA",    name: "Mastercard Inc.",                  yahooSymbol: "MA", finnhubSymbol: "MA", tradingViewSymbol: "NYSE:MA" }),
  createStock({ symbol: "PYPL",  name: "PayPal Holdings Inc.",             yahooSymbol: "PYPL", finnhubSymbol: "PYPL" }),
  createStock({ symbol: "BRK.B", name: "Berkshire Hathaway Inc. Class B",  yahooSymbol: "BRK-B", tradingViewSymbol: "NYSE:BRK/B" }),

  // ─── CONSUMER / DEFENSIVE STOCKS (13 total) ──────────────────────────────
  createStock({ symbol: "KO",    name: "Coca-Cola Co.",                    yahooSymbol: "KO", finnhubSymbol: "KO" }),
  createStock({ symbol: "PEP",   name: "PepsiCo Inc.",                     yahooSymbol: "PEP", finnhubSymbol: "PEP" }),
  createStock({ symbol: "MCD",   name: "McDonald's Corp.",                 yahooSymbol: "MCD", finnhubSymbol: "MCD" }),
  createStock({ symbol: "SBUX",  name: "Starbucks Corp.",                  yahooSymbol: "SBUX", finnhubSymbol: "SBUX" }),
  createStock({ symbol: "NKE",   name: "Nike Inc.",                        yahooSymbol: "NKE", finnhubSymbol: "NKE" }),
  createStock({ symbol: "WMT",   name: "Walmart Inc.",                     yahooSymbol: "WMT", finnhubSymbol: "WMT" }),
  createStock({ symbol: "COST",  name: "Costco Wholesale Corp.",           yahooSymbol: "COST", finnhubSymbol: "COST" }),
  createStock({ symbol: "PG",    name: "Procter & Gamble Co.",             yahooSymbol: "PG", finnhubSymbol: "PG" }),
  createStock({ symbol: "JNJ",   name: "Johnson & Johnson",                yahooSymbol: "JNJ", finnhubSymbol: "JNJ" }),
  createStock({ symbol: "UNH",   name: "UnitedHealth Group Inc.",          yahooSymbol: "UNH", finnhubSymbol: "UNH" }),
  createStock({ symbol: "HD",    name: "Home Depot Inc.",                  yahooSymbol: "HD", finnhubSymbol: "HD" }),
  createStock({ symbol: "LOW",   name: "Lowe's Companies Inc.",            yahooSymbol: "LOW", finnhubSymbol: "LOW" }),
  createStock({ symbol: "DIS",   name: "Walt Disney Co.",                  yahooSymbol: "DIS", finnhubSymbol: "DIS" }),

  // ─── ENERGY / INDUSTRIALS (9 total) ──────────────────────────────────────
  createStock({ symbol: "XOM",   name: "Exxon Mobil Corp.",                yahooSymbol: "XOM", finnhubSymbol: "XOM" }),
  createStock({ symbol: "CVX",   name: "Chevron Corp.",                    yahooSymbol: "CVX", finnhubSymbol: "CVX" }),
  createStock({ symbol: "COP",   name: "ConocoPhillips",                   yahooSymbol: "COP", finnhubSymbol: "COP" }),
  createStock({ symbol: "BA",    name: "Boeing Co.",                       yahooSymbol: "BA", finnhubSymbol: "BA", tradingViewSymbol: "NYSE:BA" }),
  createStock({ symbol: "CAT",   name: "Caterpillar Inc.",                 yahooSymbol: "CAT", finnhubSymbol: "CAT" }),
  createStock({ symbol: "GE",    name: "GE Aerospace",                     yahooSymbol: "GE", finnhubSymbol: "GE" }),
  createStock({ symbol: "LMT",   name: "Lockheed Martin Corp.",            yahooSymbol: "LMT", finnhubSymbol: "LMT" }),
  createStock({ symbol: "RTX",   name: "RTX Corporation",                  yahooSymbol: "RTX", finnhubSymbol: "RTX" }),
  createStock({ symbol: "DE",    name: "Deere & Co.",                      yahooSymbol: "DE", finnhubSymbol: "DE" }),

  // ─── ETFs (15 total) ─────────────────────────────────────────────────────
  createETF({ symbol: "SPY",  name: "SPDR S&P 500 ETF",                    yahooSymbol: "SPY", finnhubSymbol: "SPY" }),
  createETF({ symbol: "QQQ",  name: "Invesco QQQ Trust",                   yahooSymbol: "QQQ", finnhubSymbol: "QQQ" }),
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
  createCommodity({ symbol: "NATGAS", name: "Gas naturale",      yahooSymbol: "NG=F", tradingViewSymbol: "TVC:NATGAS" }),
  createCommodity({ symbol: "COPPER", name: "Rame",              yahooSymbol: "HG=F", tradingViewSymbol: "COMEX:HG1!" }),

  // ─── BONDS / RATES (2 total) ────────────────────────────────────────────
  createBond({ symbol: "US10Y", name: "US Treasury 10Y", yahooSymbol: "^TNX", tradingViewSymbol: "TVC:US10Y", assetId: "us10y" }),
  createBond({ symbol: "US30Y", name: "US Treasury 30Y", yahooSymbol: "^TYX", tradingViewSymbol: "TVC:US30Y" }),
  // Note: US02Y and CAC40 disabled — limited or no Yahoo Finance data
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
