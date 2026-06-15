import type { AssetId, MarketDataPoint } from "@/types/market";
import type { AssetUnit } from "@/lib/market";

/**
 * Tipi condivisi del livello "data provider" (Step 12).
 *
 * Questo file non importa `fs`/`path`: è sicuro da importare anche da
 * componenti client (es. `lib/market/ticker.ts`) per tipizzare quotazioni
 * e stato dati, senza tirarsi dietro logica di lettura file.
 */

/**
 * Quanto sono "fresci" i dati restituiti da un provider:
 * - "live": quotazione realtime/streaming
 * - "delayed": realtime con ritardo (es. 15 minuti)
 * - "eod": fine giornata (end-of-day) — i 3 dataset locali attuali
 * - "unavailable": nessun dato (provider assente o asset non coperto)
 */
export type DataFreshness = "live" | "delayed" | "eod" | "unavailable";

/**
 * Origine dei dati. Stringa estendibile: oggi solo `"local-static"`
 * (i 3 file `public/data/*.json`). Provider futuri aggiungeranno altri
 * valori (es. `"alpha-vantage"`, `"polygon"`, `"fmp"`) senza modificare
 * questo tipo, che resta `string` per evitare un union da aggiornare ad
 * ogni nuovo provider.
 */
export type ProviderSource = "local-static" | (string & {});

/**
 * Disponibilità dati per uno strumento, indipendente dal catalogo
 * (`MarketInstrumentStatus` in `types/markets.ts`, che è "live"/"soon" a
 * livello di catalogo/UI):
 * - "available": un provider ha restituito dati validi
 * - "soon": nessun provider associato a questo asset (placeholder catalogo)
 * - "error": un provider è associato ma la lettura è fallita
 */
export type AssetAvailability = "available" | "soon" | "error";

/** Quotazione "ultimo valore + variazione" restituita da un provider. */
export interface ProviderQuote {
  assetId: AssetId;
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
  assetId: AssetId;
  points: MarketDataPoint[];
  freshness: DataFreshness;
  source: ProviderSource;
}

/** Provider che sa restituire l'ultima quotazione per un `AssetId`. */
export interface QuoteProvider {
  readonly source: ProviderSource;
  /** `null` se il provider non ha (ancora) dati validi per `assetId`. */
  getQuote(assetId: AssetId): ProviderQuote | null;
}

/** Provider che sa restituire la serie storica per un `AssetId`. */
export interface CandleProvider {
  readonly source: ProviderSource;
  /** `null` se il provider non ha (ancora) dati validi per `assetId`. */
  getCandles(assetId: AssetId): ProviderCandles | null;
}

/**
 * Provider completo: quote + candele. Un provider concreto (locale o
 * futuro esterno) implementa questa interfaccia per uno o più `AssetId`.
 * Vedi `lib/providers/localStaticProvider.ts` per l'implementazione locale
 * e `lib/providers/index.ts` per come si registra/seleziona un provider per
 * ciascun asset.
 */
export interface MarketDataProvider extends QuoteProvider, CandleProvider {}
