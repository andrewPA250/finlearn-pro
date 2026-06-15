import type { AssetId, MarketDataPoint } from "@/types/market";
import type { AssetUnit } from "@/lib/market";
import { ASSET_LABELS, ASSET_UNITS, sanitizeSeries } from "@/lib/market";

/**
 * Quotazione sintetica per la ticker strip della Home: ultimo valore
 * disponibile + variazione rispetto al punto precedente. Calcolata da dati
 * già presenti in `public/data/*.json`, nessun provider nuovo.
 */
export interface TickerQuote {
  id: AssetId;
  label: string;
  unit: AssetUnit;
  value: number;
  change: number;
  changePercent: number;
  date: string;
}

export function buildTickerQuote(id: AssetId, data: MarketDataPoint[]): TickerQuote | null {
  const sanitized = sanitizeSeries(data);
  if (sanitized.length < 2) return null;

  const last = sanitized[sanitized.length - 1];
  const prev = sanitized[sanitized.length - 2];
  const change = last.value - prev.value;
  const changePercent = prev.value !== 0 ? (change / prev.value) * 100 : 0;

  return {
    id,
    label: ASSET_LABELS[id],
    unit: ASSET_UNITS[id],
    value: last.value,
    change,
    changePercent,
    date: last.date,
  };
}

/**
 * Costruisce le quotazioni per tutti gli asset disponibili. La Home itera su
 * questo array senza conoscere quanti asset esistono: in futuro, un
 * catalogo Markets più ampio richiederà solo di estendere `rawData`, non di
 * modificare la ticker strip.
 */
export function buildTickerQuotes(rawData: Record<AssetId, MarketDataPoint[]>): TickerQuote[] {
  return (Object.keys(rawData) as AssetId[])
    .map((id) => buildTickerQuote(id, rawData[id]))
    .filter((quote): quote is TickerQuote => quote !== null);
}
