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
export type MarketInstrumentStatus = "live" | "soon";

export interface MarketInstrument {
  /** Ticker mostrato in UI e usato nella route `/asset/[symbol]`. */
  symbol: string;
  name: string;
  category: MarketCategoryId;
  status: MarketInstrumentStatus;
  /** Presente solo per strumenti `"live"`: collega ai dataset esistenti in `lib/market.ts`. */
  assetId?: AssetId;
}
