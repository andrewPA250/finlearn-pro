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
  { id: "bond", label: "Bond" },
];

/**
 * Catalogo strumenti del modulo Markets. I tre strumenti `status: "live"`
 * sono collegati ai dataset reali già usati da Home/Workbench
 * (`public/data/sp500.json` / `gold.json` / `us10y.json` via `assetId`).
 * Gli altri sono placeholder `status: "soon"`: simbolo e nome reali, nessun
 * dato/provider — pronti a diventare "live" quando arriverà un catalogo
 * asset più ampio, senza cambiare la UI (`MarketListRow`/`MarketListSection`).
 */
export const MARKET_INSTRUMENTS: MarketInstrument[] = [
  // Azioni
  { symbol: "AAPL", name: "Apple Inc.", category: "equity", status: "soon" },
  { symbol: "MSFT", name: "Microsoft Corp.", category: "equity", status: "soon" },
  { symbol: "NVDA", name: "NVIDIA Corp.", category: "equity", status: "soon" },

  // ETF
  { symbol: "SPY", name: "SPDR S&P 500 ETF", category: "etf", status: "soon" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", category: "etf", status: "soon" },

  // Indici
  { symbol: "SPX", name: "S&P 500", category: "index", assetId: "sp500", status: "live" },

  // Crypto
  { symbol: "BTCUSD", name: "Bitcoin", category: "crypto", status: "soon" },
  { symbol: "ETHUSD", name: "Ethereum", category: "crypto", status: "soon" },

  // Forex
  { symbol: "EURUSD", name: "Euro / Dollaro USA", category: "forex", status: "soon" },
  { symbol: "USDJPY", name: "Dollaro USA / Yen Giapponese", category: "forex", status: "soon" },

  // Commodities
  { symbol: "XAUUSD", name: "Oro", category: "commodity", assetId: "gold", status: "live" },

  // Bond
  { symbol: "US10Y", name: "US Treasury 10Y", category: "bond", assetId: "us10y", status: "live" },
];

export function getInstrumentsByCategory(category: MarketCategory["id"]): MarketInstrument[] {
  return MARKET_INSTRUMENTS.filter((instrument) => instrument.category === category);
}

/** Usato dalla route `/asset/[symbol]` per risolvere lo strumento dal ticker (case-insensitive). */
export function getInstrumentBySymbol(symbol: string): MarketInstrument | undefined {
  const normalized = symbol.toUpperCase();
  return MARKET_INSTRUMENTS.find((instrument) => instrument.symbol === normalized);
}
