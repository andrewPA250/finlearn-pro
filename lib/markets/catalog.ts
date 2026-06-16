import type { MarketCategory, MarketInstrument } from "@/types/markets";

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

/**
 * Catalogo strumenti del modulo Markets (Step 10.5, esteso in Step 11).
 *
 * Questo array è la **fonte unica** per `/markets`, la Search Overlay e
 * `/asset/[symbol]`: contiene SOLO i metadati anagrafici dello strumento
 * (simbolo, nome, categoria) più due campi che descrivono la
 * **disponibilità dati**, separata dal rendering:
 * - `status: "live"` + `assetId` → lo strumento ha una serie storica reale
 *   in `public/data/*.json` (vedi `lib/market.ts` / `ASSET_FILE_NAMES`),
 *   collegata via `assetId`. Solo 3 strumenti lo sono oggi: SPX, XAUUSD,
 *   US10Y (dati FRED/Stooq, fine giornata).
 * - `status: "soon"` (nessun `assetId`) → nessun dato reale disponibile.
 *   Niente prezzi/variazioni fittizi: i componenti UI (`MarketListRow`,
 *   `AssetHero`, Search) mostrano un placeholder coerente ("Soon") senza
 *   bisogno di valori finti.
 *
 * **Collegare un futuro provider dati** per uno strumento "soon" richiede
 * solo: (1) aggiungere il suo id a `AssetId` (`types/market.ts`) e alle
 * mappe `ASSET_*`/`ASSET_FILE_NAMES` (`lib/market.ts`), (2) fornire il file
 * `public/data/<id>.json`, (3) impostare qui `status: "live"` e
 * `assetId: "<id>"`. Nessuna modifica a Markets/Search/AssetPage: leggono
 * tutti questo catalogo e reagiscono già a `status`/`assetId`.
 */
export const MARKET_INSTRUMENTS: MarketInstrument[] = [
  // Indici — Yahoo Finance
  { symbol: "SPX",  name: "S&P 500",                         category: "index",     assetId: "sp500", status: "delayed", tradingViewSymbol: "TVC:SPX",         yahooSymbol: "^GSPC" },
  { symbol: "NDX",  name: "Nasdaq 100",                      category: "index",                       status: "delayed", tradingViewSymbol: "NASDAQ:NDX",       yahooSymbol: "^NDX" },
  { symbol: "DJI",  name: "Dow Jones Industrial Average",    category: "index",                       status: "delayed", tradingViewSymbol: "DJ:DJI",           yahooSymbol: "^DJI" },
  { symbol: "RUT",  name: "Russell 2000",                    category: "index",                       status: "delayed", tradingViewSymbol: "TVC:RUT",          yahooSymbol: "^RUT" },

  // Azioni — Yahoo Finance (primary) + Finnhub (fallback)
  { symbol: "AAPL",  name: "Apple Inc.",                       category: "equity", status: "delayed", finnhubSymbol: "AAPL",  tradingViewSymbol: "NASDAQ:AAPL",  yahooSymbol: "AAPL"  },
  { symbol: "MSFT",  name: "Microsoft Corp.",                  category: "equity", status: "delayed", finnhubSymbol: "MSFT",  tradingViewSymbol: "NASDAQ:MSFT",  yahooSymbol: "MSFT"  },
  { symbol: "NVDA",  name: "NVIDIA Corp.",                     category: "equity", status: "delayed", finnhubSymbol: "NVDA",  tradingViewSymbol: "NASDAQ:NVDA",  yahooSymbol: "NVDA"  },
  { symbol: "AMZN",  name: "Amazon.com Inc.",                  category: "equity", status: "delayed", finnhubSymbol: "AMZN",  tradingViewSymbol: "NASDAQ:AMZN",  yahooSymbol: "AMZN"  },
  { symbol: "GOOGL", name: "Alphabet Inc. (Classe A)",         category: "equity", status: "delayed", finnhubSymbol: "GOOGL", tradingViewSymbol: "NASDAQ:GOOGL", yahooSymbol: "GOOGL" },
  { symbol: "META",  name: "Meta Platforms Inc.",              category: "equity", status: "delayed", finnhubSymbol: "META",  tradingViewSymbol: "NASDAQ:META",  yahooSymbol: "META"  },
  { symbol: "TSLA",  name: "Tesla Inc.",                       category: "equity", status: "delayed", finnhubSymbol: "TSLA",  tradingViewSymbol: "NASDAQ:TSLA",  yahooSymbol: "TSLA"  },
  { symbol: "AMD",   name: "Advanced Micro Devices Inc.",      category: "equity", status: "delayed", finnhubSymbol: "AMD",   tradingViewSymbol: "NASDAQ:AMD",   yahooSymbol: "AMD"   },
  { symbol: "PLTR",  name: "Palantir Technologies Inc.",       category: "equity", status: "delayed",                         tradingViewSymbol: "NASDAQ:PLTR",  yahooSymbol: "PLTR"  },

  // ETF — Yahoo Finance
  { symbol: "SPY",  name: "SPDR S&P 500 ETF",                  category: "etf", status: "delayed", finnhubSymbol: "SPY", tradingViewSymbol: "AMEX:SPY",    yahooSymbol: "SPY"  },
  { symbol: "QQQ",  name: "Invesco QQQ Trust",                  category: "etf", status: "delayed", finnhubSymbol: "QQQ", tradingViewSymbol: "NASDAQ:QQQ",  yahooSymbol: "QQQ"  },
  { symbol: "VOO",  name: "Vanguard S&P 500 ETF",               category: "etf", status: "delayed",                       tradingViewSymbol: "AMEX:VOO",    yahooSymbol: "VOO"  },
  { symbol: "VTI",  name: "Vanguard Total Stock Market ETF",    category: "etf", status: "delayed",                       tradingViewSymbol: "AMEX:VTI",    yahooSymbol: "VTI"  },
  { symbol: "SCHD", name: "Schwab US Dividend Equity ETF",      category: "etf", status: "delayed",                       tradingViewSymbol: "AMEX:SCHD",   yahooSymbol: "SCHD" },
  { symbol: "AGG",  name: "iShares Core US Aggregate Bond ETF", category: "etf", status: "delayed",                       tradingViewSymbol: "AMEX:AGG",    yahooSymbol: "AGG"  },
  { symbol: "BND",  name: "Vanguard Total Bond Market ETF",     category: "etf", status: "delayed",                       tradingViewSymbol: "AMEX:BND",    yahooSymbol: "BND"  },

  // Crypto — Yahoo Finance (primary); ~near-live
  { symbol: "BTCUSD", name: "Bitcoin",  category: "crypto", status: "delayed", tradingViewSymbol: "BINANCE:BTCUSDT", yahooSymbol: "BTC-USD" },
  { symbol: "ETHUSD", name: "Ethereum", category: "crypto", status: "delayed", tradingViewSymbol: "BINANCE:ETHUSDT", yahooSymbol: "ETH-USD" },
  { symbol: "XRPUSD", name: "XRP",      category: "crypto", status: "delayed", tradingViewSymbol: "BINANCE:XRPUSDT", yahooSymbol: "XRP-USD" },
  { symbol: "ADAUSD", name: "Cardano",  category: "crypto", status: "delayed", tradingViewSymbol: "BINANCE:ADAUSDT", yahooSymbol: "ADA-USD" },

  // Forex — Yahoo Finance (primary)
  { symbol: "EURUSD", name: "Euro / Dollaro USA",              category: "forex", status: "delayed", tradingViewSymbol: "FX:EURUSD", yahooSymbol: "EURUSD=X" },
  { symbol: "GBPUSD", name: "Sterlina / Dollaro USA",          category: "forex", status: "delayed", tradingViewSymbol: "FX:GBPUSD", yahooSymbol: "GBPUSD=X" },
  { symbol: "USDJPY", name: "Dollaro USA / Yen Giapponese",    category: "forex", status: "delayed", tradingViewSymbol: "FX:USDJPY", yahooSymbol: "USDJPY=X" },

  // Commodities — Yahoo Finance (futures)
  { symbol: "XAUUSD", name: "Oro",         category: "commodity", assetId: "gold", status: "delayed", tradingViewSymbol: "TVC:GOLD",       yahooSymbol: "GC=F"  },
  { symbol: "XAGUSD", name: "Argento",      category: "commodity",                  status: "delayed", tradingViewSymbol: "TVC:SILVER",      yahooSymbol: "SI=F"  },
  { symbol: "WTI",    name: "Petrolio WTI", category: "commodity",                  status: "delayed", tradingViewSymbol: "TVC:USOIL",       yahooSymbol: "CL=F"  },
  { symbol: "NATGAS", name: "Gas naturale", category: "commodity",                  status: "delayed", tradingViewSymbol: "TVC:NATURALGAS",  yahooSymbol: "NG=F"  },

  // Bond / Rates — Yahoo Finance (indices)
  { symbol: "US10Y", name: "US Treasury 10Y", category: "bond", assetId: "us10y", status: "delayed", tradingViewSymbol: "TVC:US10Y", yahooSymbol: "^TNX" },
  { symbol: "US02Y", name: "US Treasury 2Y",  category: "bond",                   status: "soon",    tradingViewSymbol: "TVC:US02Y" },
  { symbol: "US30Y", name: "US Treasury 30Y", category: "bond",                   status: "delayed", tradingViewSymbol: "TVC:US30Y", yahooSymbol: "^TYX" },
];

export function getInstrumentsByCategory(category: MarketCategory["id"]): MarketInstrument[] {
  return MARKET_INSTRUMENTS.filter((instrument) => instrument.category === category);
}

/** Usato dalla route `/asset/[symbol]` per risolvere lo strumento dal ticker (case-insensitive). */
export function getInstrumentBySymbol(symbol: string): MarketInstrument | undefined {
  const normalized = symbol.toUpperCase();
  return MARKET_INSTRUMENTS.find((instrument) => instrument.symbol === normalized);
}
