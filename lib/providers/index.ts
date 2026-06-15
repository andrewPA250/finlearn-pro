import type { AssetId, MarketDataPoint } from "@/types/market";
import type { MarketInstrument } from "@/types/markets";
import { localStaticProvider } from "./localStaticProvider";
import type { AssetAvailability, MarketDataProvider, ProviderQuote } from "./types";

export * from "./types";
export { localStaticProvider };

/**
 * Registro provider → asset (Step 12).
 *
 * Per ogni `AssetId` indica quale `MarketDataProvider` lo serve. Oggi tutti
 * e 3 gli asset reali (`sp500`/`gold`/`us10y`) usano `localStaticProvider`.
 *
 * **Aggiungere un provider futuro per una categoria** (es. un provider
 * realtime per le azioni, un provider crypto, un provider forex):
 * 1. Implementare `MarketDataProvider` (vedi `./types`) in un nuovo file
 *    `lib/providers/<nome>Provider.ts` (es. `equitiesProvider.ts`),
 *    impostando `source`/`freshness` appropriati (es. `"delayed"`/`"live"`).
 * 2. Aggiungere le voci `AssetId → provider` qui sotto.
 * 3. Se necessario, implementare **fallback**: `getAssetQuote`/`getAssetCandles`
 *    possono provare un provider primario e, se ritorna `null`, ricadere su
 *    un secondo provider (es. dati EOD come backup di un feed realtime) —
 *    il chiamante (pagine/componenti) non cambia.
 *
 * Nessuna di queste modifiche tocca `/markets`, `/asset/[symbol]`, la Search
 * o il Workbench: tutti leggono solo le funzioni esportate da questo modulo.
 */
const PROVIDERS_BY_ASSET: Partial<Record<AssetId, MarketDataProvider>> = {
  sp500: localStaticProvider,
  gold: localStaticProvider,
  us10y: localStaticProvider,
};

const PROVIDED_ASSET_IDS = Object.keys(PROVIDERS_BY_ASSET) as AssetId[];

/**
 * Disponibilità dati per uno strumento del catalogo Markets
 * (`MARKET_INSTRUMENTS`, `lib/markets/catalog.ts`):
 * - `"soon"` se lo strumento non ha `assetId` (placeholder catalogo, nessun
 *   provider può ancora servirlo)
 * - `"available"` se è registrato un provider per il suo `assetId`
 * - `"error"` se ha un `assetId` ma nessun provider è registrato (config
 *   incoerente — non dovrebbe accadere con il catalogo attuale)
 *
 * Pensata per badge futuri (es. Watchlist) che vogliano distinguere "non
 * ancora collegato" da "collegato ma momentaneamente non disponibile".
 */
export function getAssetAvailability(instrument: MarketInstrument): AssetAvailability {
  if (!instrument.assetId) return "soon";
  return PROVIDERS_BY_ASSET[instrument.assetId] ? "available" : "error";
}

/** Ultima quotazione per un asset, o `null` se nessun provider la fornisce. */
export function getAssetQuote(assetId: AssetId): ProviderQuote | null {
  return PROVIDERS_BY_ASSET[assetId]?.getQuote(assetId) ?? null;
}

/** Serie storica per un asset, o `[]` se nessun provider la fornisce (mai dati finti). */
export function getAssetCandles(assetId: AssetId): MarketDataPoint[] {
  return PROVIDERS_BY_ASSET[assetId]?.getCandles(assetId)?.points ?? [];
}

/**
 * Quotazione per uno strumento del catalogo Markets: risolve `assetId` (se
 * presente) e delega a `getAssetQuote`. Ritorna `null` per gli strumenti
 * `"soon"` (nessun `assetId`) — l'asset page mostra il placeholder elegante.
 */
export function getInstrumentQuote(instrument: MarketInstrument): ProviderQuote | null {
  return instrument.assetId ? getAssetQuote(instrument.assetId) : null;
}

/**
 * Tutte le quotazioni disponibili oggi (i 3 asset reali). Usata dai ticker
 * di Home e `/markets`: itera sugli `AssetId` registrati, non su un elenco
 * fisso — un futuro provider aggiunto al registro appare qui automaticamente.
 */
export function getAllAssetQuotes(): ProviderQuote[] {
  return PROVIDED_ASSET_IDS.map((id) => getAssetQuote(id)).filter(
    (quote): quote is ProviderQuote => quote !== null
  );
}
