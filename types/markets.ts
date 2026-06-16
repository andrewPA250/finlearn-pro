import type { AssetId } from "@/types/market";

/**
 * Categorie del catalogo Markets (sez. Step 10.5). Indipendenti dalle
 * `AssetClass` della search (`lib/search/searchIndex.ts`): quando i due
 * catalghi verranno unificati basterà far convergere le due liste, senza
 * impatti sui componenti che consumano questi tipi.
 */
export type MarketCategoryId =
  | "equity"
  | "etf"
  | "index"
  | "crypto"
  | "forex"
  | "commodity"
  | "bond";

export interface MarketCategory {
  id: MarketCategoryId;
  label: string;
}

/**
 * Un singolo strumento del catalogo Markets. `status: "live"` indica che lo
 * strumento ha dati reali disponibili (collegati via `assetId` ai dataset di
 * `public/data/*.json`); `status: "soon"` indica un placeholder in attesa di
 * un provider dati.
 */
/**
 * Stato dati di uno strumento nel catalogo:
 * - `"live"`: dati reali EOD da file locali (SPX, XAUUSD, US10Y)
 * - `"delayed"`: dati ritardati da provider esterno (Finnhub, free tier)
 * - `"soon"`: nessun provider ancora collegato
 */
export type MarketInstrumentStatus = "live" | "delayed" | "soon";

export interface MarketInstrument {
  /** Ticker mostrato in UI e usato nella route `/asset/[symbol]`. */
  symbol: string;
  name: string;
  category: MarketCategoryId;
  status: MarketInstrumentStatus;
  /** Presente solo per strumenti `"live"`: collega ai dataset locali (`public/data/*.json`). */
  assetId?: AssetId;
  /** Presente solo per strumenti `"delayed"`: simbolo nel formato atteso dall'API Finnhub. */
  finnhubSymbol?: string;
  /** Simbolo TradingView (es. "NASDAQ:AAPL"). Quando presente, la pagina asset mostra il widget TradingView. */
  tradingViewSymbol?: string;
  /** Simbolo Yahoo Finance (es. "AAPL", "BTC-USD", "^GSPC"). Usato dal yahooProvider. */
  yahooSymbol?: string;
}
