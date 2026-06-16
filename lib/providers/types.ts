import type { MarketDataPoint } from "@/types/market";
import type { AssetUnit } from "@/lib/market";

/**
 * Tipi condivisi del livello "data provider" (Step 12, aggiornati Step 13/13.x/13.2).
 *
 * Questo file non importa `fs`/`path`: è sicuro da importare anche da
 * componenti client (es. `lib/market/ticker.ts`) per tipizzare quotazioni
 * e stato dati, senza tirarsi dietro logica di lettura file.
 */

/**
 * Quanto sono "fresci" i dati restituiti da un provider:
 * - "live":          quotazione realtime/streaming (WebSocket)
 * - "near-live":     aggiornamento frequente via REST polling (CoinGecko, < 5 min)
 * - "delayed":       realtime con ritardo (es. ~15 min — Finnhub free tier, mercato aperto)
 * - "market-closed": mercato chiuso, dato = ultimo close della sessione precedente
 * - "eod":           fine giornata (Frankfurter/BCE, local-static)
 * - "unavailable":   nessun dato (provider presente ma risposta nulla)
 */
export type DataFreshness =
  | "live"
  | "near-live"
  | "delayed"
  | "market-closed"
  | "eod"
  | "unavailable";

/**
 * Origine dei dati. Stringa estendibile.
 */
export type ProviderSource =
  | "local-static"
  | "finnhub"
  | "coingecko"
  | "frankfurter-ecb"
  | "yahoo"
  | (string & {});

/**
 * Disponibilità dati per uno strumento:
 * - "available": un provider ha restituito dati validi
 * - "soon": nessun provider associato a questo strumento
 * - "error": provider associato ma lettura fallita
 */
export type AssetAvailability = "available" | "soon" | "error";

/**
 * Metriche fondamentali e di mercato aggiuntive (Yahoo Finance).
 * Tutti i campi sono opzionali: non tutti i provider/strumenti li espongono.
 */
export interface ProviderStats {
  previousClose?: number;
  open?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  avgVolume?: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  /** Dividend yield in % (es. 0.52 = 0.52%). */
  dividendYield?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

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
  /**
   * Unix timestamp (secondi) dell'ultimo dato, se disponibile dal provider.
   * Usato per visualizzare l'orario esatto (es. "Last Trade 22:00") nei badge.
   * Non disponibile per local-static e frankfurter-ecb (solo data).
   */
  timestamp?: number;
  freshness: DataFreshness;
  source: ProviderSource;
  /** Metriche aggiuntive (Yahoo Finance). Presenti solo per provider Yahoo. */
  stats?: ProviderStats;
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
