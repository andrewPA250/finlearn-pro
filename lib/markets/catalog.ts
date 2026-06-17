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

  // ─── ETFs (16 total) ─────────────────────────────────────────────────────
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
  createCommodity({ symbol: "NATGAS", name: "Gas naturale",      yahooSymbol: "NG=F", tradingViewSymbol: "TVC:NATGAS" }),
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

  // ─── SEMICONDUCTORS & TECH HARDWARE (13 total) ───────────────────────────
  createStock({ symbol: "AMAT",  name: "Applied Materials Inc.",            yahooSymbol: "AMAT", finnhubSymbol: "AMAT" }),
  createStock({ symbol: "MU",    name: "Micron Technology Inc.",            yahooSymbol: "MU", finnhubSymbol: "MU" }),
  createStock({ symbol: "LRCX",  name: "Lam Research Corporation",          yahooSymbol: "LRCX", finnhubSymbol: "LRCX" }),
  createStock({ symbol: "KLAC",  name: "KLA Corporation",                   yahooSymbol: "KLAC", finnhubSymbol: "KLAC" }),
  createStock({ symbol: "NVDA",  name: "NVIDIA Corporation",                yahooSymbol: "NVDA", finnhubSymbol: "NVDA" }),
  createStock({ symbol: "ASML",  name: "ASML Holding NV",                   yahooSymbol: "ASML", finnhubSymbol: "ASML" }),
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

  // ─── DEFENSE & AEROSPACE (7 total) ──────────────────────────────────────
  createStock({ symbol: "NOC",   name: "Northrop Grumman Corporation",      yahooSymbol: "NOC", finnhubSymbol: "NOC" }),
  createStock({ symbol: "GD",    name: "General Dynamics Corporation",      yahooSymbol: "GD", finnhubSymbol: "GD" }),
  createStock({ symbol: "LMT",   name: "Lockheed Martin Corporation",       yahooSymbol: "LMT", finnhubSymbol: "LMT" }),
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

  // ─── EUROPEAN STOCKS - MAJOR CAPS (13 total) ──────────────────────────────
  createStock({ symbol: "ASML",  name: "ASML Holding N.V.",                 yahooSymbol: "ASML", finnhubSymbol: "ASML" }),
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
