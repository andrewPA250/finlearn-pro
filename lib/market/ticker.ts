import type { AssetUnit } from "@/lib/market";
import type { DataFreshness, ProviderQuote, ProviderSource, ProviderStats } from "@/lib/providers/types";

/**
 * Quotazione sintetica per la ticker strip della Home, il Market List
 * Pattern (`/markets`) e l'hero asset (`/asset/[symbol]`): ultimo valore
 * disponibile + variazione rispetto al punto precedente.
 *
 * Dallo Step 12 questi dati arrivano dal livello provider
 * (`lib/providers`, vedi `ProviderQuote`) tramite `quoteFromProvider`:
 * `freshness`/`source` viaggiano insieme al valore, pronti per badge futuri
 * ("Live"/"Delayed"/"EOD"/"Unavailable") senza ulteriori modifiche al tipo.
 */
export interface TickerQuote {
  /** Simbolo del catalogo Markets (es. "SPX", "AAPL"). Usato come React key. */
  id: string;
  label: string;
  unit: AssetUnit;
  value: number;
  change: number;
  changePercent: number;
  date: string;
  /** Unix timestamp (secondi) dell'ultimo dato, se disponibile dal provider. */
  timestamp?: number;
  freshness: DataFreshness;
  source: ProviderSource;
  /** Metriche aggiuntive (Yahoo Finance). */
  stats?: ProviderStats;
}

/** Adatta la quotazione di un provider (`lib/providers`) al tipo usato dalla UI. */
export function quoteFromProvider(quote: ProviderQuote): TickerQuote {
  return {
    id: quote.symbol,
    label: quote.label,
    unit: quote.unit,
    value: quote.value,
    change: quote.change,
    changePercent: quote.changePercent,
    date: quote.date,
    timestamp: quote.timestamp,
    freshness: quote.freshness,
    source: quote.source,
    stats: quote.stats,
  };
}

/** Formattazione condivisa del valore di una quotazione (Home ticker, Markets list, Asset page). */
export function formatQuoteValue(quote: TickerQuote): string {
  if (quote.unit === "percent") {
    return `${quote.value.toFixed(2)}%`;
  }
  return quote.value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Formattazione condivisa della variazione di una quotazione (Home ticker, Markets list, Asset page). */
export function formatQuoteChange(quote: TickerQuote): string {
  const sign = quote.change >= 0 ? "+" : "";
  if (quote.unit === "percent") {
    return `${sign}${quote.change.toFixed(2)} pp`;
  }
  return `${sign}${quote.changePercent.toFixed(2)}%`;
}

/**
 * Variazione completa per l'hero: assoluta + percentuale.
 * Es. "+5,47 (+1,82%)" oppure "−5,47 (−1,82%)".
 * Usata nell'AssetHero per la gerarchia visiva del prezzo.
 */
export function formatQuoteChangeDetail(quote: TickerQuote): string {
  const isPos = quote.change >= 0;
  const sign = isPos ? "+" : "−"; // + oppure −
  if (quote.unit === "percent") {
    return `${sign}${Math.abs(quote.change).toFixed(2)} pp`;
  }
  const absChange = Math.abs(quote.change).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const absPct = Math.abs(quote.changePercent).toFixed(2);
  return `${sign}${absChange} (${sign}${absPct}%)`;
}
