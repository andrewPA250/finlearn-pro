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
  // Indici
  { symbol: "SPX", name: "S&P 500", category: "index", assetId: "sp500", status: "live" },
  { symbol: "NDX", name: "Nasdaq 100", category: "index", status: "soon" },
  { symbol: "DJI", name: "Dow Jones Industrial Average", category: "index", status: "soon" },
  { symbol: "RUT", name: "Russell 2000", category: "index", status: "soon" },

  // Azioni
  { symbol: "AAPL", name: "Apple Inc.", category: "equity", status: "soon" },
  { symbol: "MSFT", name: "Microsoft Corp.", category: "equity", status: "soon" },
  { symbol: "NVDA", name: "NVIDIA Corp.", category: "equity", status: "soon" },
  { symbol: "AMZN", name: "Amazon.com Inc.", category: "equity", status: "soon" },
  { symbol: "GOOGL", name: "Alphabet Inc. (Classe A)", category: "equity", status: "soon" },
  { symbol: "META", name: "Meta Platforms Inc.", category: "equity", status: "soon" },
  { symbol: "TSLA", name: "Tesla Inc.", category: "equity", status: "soon" },
  { symbol: "AMD", name: "Advanced Micro Devices Inc.", category: "equity", status: "soon" },
  { symbol: "PLTR", name: "Palantir Technologies Inc.", category: "equity", status: "soon" },

  // ETF
  { symbol: "SPY", name: "SPDR S&P 500 ETF", category: "etf", status: "soon" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", category: "etf", status: "soon" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", category: "etf", status: "soon" },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", category: "etf", status: "soon" },
  { symbol: "SCHD", name: "Schwab US Dividend Equity ETF", category: "etf", status: "soon" },
  { symbol: "AGG", name: "iShares Core US Aggregate Bond ETF", category: "etf", status: "soon" },
  { symbol: "BND", name: "Vanguard Total Bond Market ETF", category: "etf", status: "soon" },

  // Crypto
  { symbol: "BTCUSD", name: "Bitcoin", category: "crypto", status: "soon" },
  { symbol: "ETHUSD", name: "Ethereum", category: "crypto", status: "soon" },
  { symbol: "XRPUSD", name: "XRP", category: "crypto", status: "soon" },
  { symbol: "ADAUSD", name: "Cardano", category: "crypto", status: "soon" },

  // Forex
  { symbol: "EURUSD", name: "Euro / Dollaro USA", category: "forex", status: "soon" },
  { symbol: "GBPUSD", name: "Sterlina / Dollaro USA", category: "forex", status: "soon" },
  { symbol: "USDJPY", name: "Dollaro USA / Yen Giapponese", category: "forex", status: "soon" },

  // Commodities
  { symbol: "XAUUSD", name: "Oro", category: "commodity", assetId: "gold", status: "live" },
  { symbol: "XAGUSD", name: "Argento", category: "commodity", status: "soon" },
  { symbol: "WTI", name: "Petrolio WTI", category: "commodity", status: "soon" },
  { symbol: "NATGAS", name: "Gas naturale", category: "commodity", status: "soon" },

  // Bond / Rates
  { symbol: "US10Y", name: "US Treasury 10Y", category: "bond", assetId: "us10y", status: "live" },
  { symbol: "US02Y", name: "US Treasury 2Y", category: "bond", status: "soon" },
  { symbol: "US30Y", name: "US Treasury 30Y", category: "bond", status: "soon" },
];

export function getInstrumentsByCategory(category: MarketCategory["id"]): MarketInstrument[] {
  return MARKET_INSTRUMENTS.filter((instrument) => instrument.category === category);
}

/** Usato dalla route `/asset/[symbol]` per risolvere lo strumento dal ticker (case-insensitive). */
export function getInstrumentBySymbol(symbol: string): MarketInstrument | undefined {
  const normalized = symbol.toUpperCase();
  return MARKET_INSTRUMENTS.find((instrument) => instrument.symbol === normalized);
}
