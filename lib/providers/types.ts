import type { MarketDataPoint } from "@/types/market";
import type { AssetUnit } from "@/lib/market";

/**
 * Tipi condivisi del livello "data provider" (Step 12, aggiornati Step 13).
 *
 * Questo file non importa `fs`/`path`: è sicuro da importare anche da
 * componenti client (es. `lib/market/ticker.ts`) per tipizzare quotazioni
 * e stato dati, senza tirarsi dietro logica di lettura file.
 */

/**
 * Quanto sono "fresci" i dati restituiti da un provider:
 * - "live": quotazione realtime/streaming
 * - "delayed": realtime con ritardo (es. 15 minuti — Finnhub free tier)
 * - "eod": fine giornata (end-of-day) — i 3 dataset locali statici
 * - "unavailable": nessun dato (provider assente o asset non coperto)
 */
export type DataFreshness = "live" | "delayed" | "eod" | "unavailable";

/**
 * Origine dei dati. Stringa estendibile: `"local-static"` per i file JSON
 * locali, `"finnhub"` per il provider Finnhub (Step 13).
 */
export type ProviderSource = "local-static" | "finnhub" | "coingecko" | "frankfurter-ecb" | (string & {});

/**
 * Disponibilità dati per uno strumento:
 * - "available": un provider ha restituito dati validi
 * - "soon": nessun provider associato a questo strumento
 * - "error": provider associato ma lettura fallita
 */
export type AssetAvailability = "available" | "soon" | "error";

/** Quotazione "ultimo valore + variazione" restituita da un provider. */
export interface ProviderQuote {
  /** Simbolo del catalogo Markets (es. "SPX", "AAPL", "BTCUSD"). */
  symbol: string;
  label: string;
  unit: AssetUnit;
  value: number;
  change: number;
  changePercent: number;
  /** Data dell'ultimo punto (formato ISO `YYYY-MM-DD`). */
  date: string;
  freshness: DataFreshness;
  source: ProviderSource;
}

/** Serie storica ("candele"/punti) restituita da un provider. */
export interface ProviderCandles {
  symbol: string;
  points: MarketDataPoint[];
  freshness: DataFreshness;
  source: ProviderSource;
}

/** Provider che sa restituire l'ultima quotazione per un simbolo catalogo. */
export interface QuoteProvider {
  readonly source: ProviderSource;
  getQuote(symbol: string): Promise<ProviderQuote | null>;
}

/** Provider che sa restituire la serie storica per un simbolo catalogo. */
export interface CandleProvider {
  readonly source: ProviderSource;
  getCandles(symbol: string): Promise<ProviderCandles | null>;
}

/** Provider completo: quote + candele. */
export interface MarketDataProvider extends QuoteProvider, CandleProvider {}
