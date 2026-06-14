import type { AssetId, MarketDataPoint, Timeframe } from "@/types/market";

/** Etichette leggibili per ciascun asset (sez. 4-5 spec). */
export const ASSET_LABELS: Record<AssetId, string> = {
  sp500: "S&P 500",
  gold: "Oro",
  us10y: "US Treasury 10Y",
};

/** Nome del file JSON statico in `public/data/` per ciascun asset. */
export const ASSET_FILE_NAMES: Record<AssetId, string> = {
  sp500: "sp500.json",
  gold: "gold.json",
  us10y: "us10y.json",
};

/**
 * Fonte e identificativo della serie storica usata per ciascun asset
 * (sez. 5 spec). FRED per sp500/us10y; l'oro è importato da Stooq
 * (`https://stooq.com/q/d/l/?s=xauusd&i=d`, colonna `Close`) perché le serie
 * gold fix di FRED (`GOLDAMGBD228NLBM`/`GOLDPMGBD228NLBM`) sono state rimosse.
 */
export const ASSET_SOURCE_LABELS: Record<AssetId, string> = {
  sp500: "FRED: SP500",
  gold: "Stooq: XAUUSD",
  us10y: "FRED: DGS10",
};

/**
 * Unità del valore di un asset:
 * - "index": prezzo, normalizzabile a base 100 (S&P 500, Oro)
 * - "percent": rendimento percentuale, NON normalizzabile (US Treasury 10Y)
 */
export type AssetUnit = "index" | "percent";

export const ASSET_UNITS: Record<AssetId, AssetUnit> = {
  sp500: "index",
  gold: "index",
  us10y: "percent",
};

export const TIMEFRAMES: Timeframe[] = ["1Y", "5Y", "10Y"];

const TIMEFRAME_DAYS: Record<Timeframe, number> = {
  "1Y": 365,
  "5Y": 365 * 5,
  "10Y": 365 * 10,
};

/** Range minimo richiesto dalla spec (sez. 5): 2004-2024, ~20 anni. */
export const REQUIRED_RANGE_LABEL = "2004–2024 (minimo ~20 anni)";

/** Numero minimo di punti perché una serie non sia considerata placeholder. */
const MIN_POINTS = 50;

/** Tolleranza sulla copertura richiesta (90% del timeframe selezionato). */
const COVERAGE_TOLERANCE = 0.9;

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Filtra valori non numerici/date invalide e ordina la serie per data
 * crescente. Punto di ingresso per qualsiasi dataset caricato da
 * `public/data/*.json`, così il resto delle utility può assumere dati validi
 * e ordinati.
 */
export function sanitizeSeries(data: MarketDataPoint[]): MarketDataPoint[] {
  return data
    .filter(
      (point) =>
        point &&
        typeof point.date === "string" &&
        !Number.isNaN(new Date(point.date).getTime()) &&
        Number.isFinite(point.value)
    )
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function spanDays(data: MarketDataPoint[]): number {
  if (data.length < 2) return 0;
  const first = new Date(data[0].date).getTime();
  const last = new Date(data[data.length - 1].date).getTime();
  return (last - first) / ONE_DAY_MS;
}

/**
 * Vero se la serie (già sanificata) copre almeno il timeframe richiesto.
 * Usato per distinguere dati reali da dati placeholder/insufficienti senza
 * dover marcare esplicitamente i file: una serie con pochi mesi di dati
 * (come i placeholder attuali) non soddisfa nemmeno il timeframe "1Y".
 */
export function hasSufficientData(data: MarketDataPoint[], timeframe: Timeframe): boolean {
  if (data.length < MIN_POINTS) return false;
  return spanDays(data) >= TIMEFRAME_DAYS[timeframe] * COVERAGE_TOLERANCE;
}

/**
 * Filtra la serie agli ultimi N anni rispetto all'ultimo punto disponibile
 * (non rispetto a "oggi", per non dipendere dalla data di build/run).
 */
export function filterByTimeframe(data: MarketDataPoint[], timeframe: Timeframe): MarketDataPoint[] {
  if (data.length === 0) return [];
  const lastDate = new Date(data[data.length - 1].date).getTime();
  const cutoff = lastDate - TIMEFRAME_DAYS[timeframe] * ONE_DAY_MS;
  return data.filter((point) => new Date(point.date).getTime() >= cutoff);
}

/**
 * Normalizza una serie "prezzo" a base 100 sul suo primo punto.
 * Va chiamata DOPO `filterByTimeframe`, così la base è sempre il primo
 * punto del timeframe selezionato (sez. "Decisioni" della richiesta).
 */
export function normalizeBase100(data: MarketDataPoint[]): MarketDataPoint[] {
  if (data.length === 0) return [];
  const base = data[0].value;
  if (!Number.isFinite(base) || base === 0) return data;
  return data.map((point) => ({ date: point.date, value: (point.value / base) * 100 }));
}

/** Media mobile semplice a `window` periodi. Opera sulla serie grezza (non filtrata). */
export function movingAverage(data: MarketDataPoint[], window: number): MarketDataPoint[] {
  if (data.length < window) return [];
  const result: MarketDataPoint[] = [];
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].value;
    if (i >= window) sum -= data[i - window].value;
    if (i >= window - 1) result.push({ date: data[i].date, value: sum / window });
  }
  return result;
}

/**
 * Deviazione standard mobile a `window` periodi dei rendimenti giornalieri
 * (in %), che esprime la "dispersione dei rendimenti" (sez. 5 spec, lezione
 * 4 — Volatilità). Sempre espressa in punti percentuali, indipendentemente
 * dall'unità dell'asset primario.
 */
export function rollingStdDev(data: MarketDataPoint[], window: number): MarketDataPoint[] {
  if (data.length < window + 1) return [];
  const returns: MarketDataPoint[] = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].value;
    if (prev === 0) continue;
    returns.push({ date: data[i].date, value: ((data[i].value - prev) / prev) * 100 });
  }
  const result: MarketDataPoint[] = [];
  for (let i = window - 1; i < returns.length; i++) {
    let sum = 0;
    for (let j = i - window + 1; j <= i; j++) sum += returns[j].value;
    const mean = sum / window;
    let variance = 0;
    for (let j = i - window + 1; j <= i; j++) variance += (returns[j].value - mean) ** 2;
    variance /= window;
    result.push({ date: returns[i].date, value: Math.sqrt(variance) });
  }
  return result;
}

/**
 * Allinea una serie secondaria sull'asse delle date di una serie primaria,
 * propagando l'ultimo valore noto (forward-fill) per le date in cui la
 * serie secondaria non ha un punto proprio. Gestisce in modo robusto
 * calendari diversi tra asset (es. Oro/Treasury vs S&P 500).
 */
export function forwardFillOnDates(
  dates: string[],
  series: MarketDataPoint[]
): Map<string, number> {
  const lookup = new Map(series.map((point) => [point.date, point.value]));
  const result = new Map<string, number>();
  let last: number | undefined;
  for (const date of dates) {
    if (lookup.has(date)) last = lookup.get(date);
    if (last !== undefined) result.set(date, last);
  }
  return result;
}

/** Punto del grafico combinato pronto per Recharts. */
export interface ChartPoint {
  date: string;
  primary?: number;
  secondary?: number;
  ma200?: number;
  stdDev?: number;
}

export type SeriesKey = "primary" | "secondary" | "ma200" | "stdDev";

export interface SeriesMeta {
  key: SeriesKey;
  label: string;
  unit: AssetUnit;
  color: string;
}
