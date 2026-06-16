import type { MarketDataPoint } from "@/types/market";
import type { MarketInstrument } from "@/types/markets";
import { localStaticProvider } from "./localStaticProvider";
import { finnhubProvider } from "./finnhubProvider";
import { coinGeckoProvider } from "./coinGeckoProvider";
import { frankfurterProvider } from "./frankfurterProvider";
import type { AssetAvailability, CandleProvider, ProviderQuote, QuoteProvider } from "./types";

export * from "./types";
export { localStaticProvider, finnhubProvider, coinGeckoProvider, frankfurterProvider };

/**
 * Registro provider per simbolo catalogo (Step 12 architettura,
 * Step 13 Finnhub, Step 13.x CoinGecko + Frankfurter).
 *
 * Ogni simbolo punta a un solo QuoteProvider; il provider decide
 * internamente come recuperare il dato. Cambiare provider per un simbolo
 * (es. passare da Finnhub a un feed live) richiede solo di aggiornare
 * questa mappa — zero modifiche alle pagine/componenti.
 */
const QUOTE_PROVIDERS: Record<string, QuoteProvider> = {
  // Provider locale EOD — serie storiche JSON (FRED / Stooq)
  SPX: localStaticProvider,
  XAUUSD: localStaticProvider,
  US10Y: localStaticProvider,

  // Finnhub — azioni e ETF USA (delayed ~15 min, free tier)
  AAPL: finnhubProvider,
  MSFT: finnhubProvider,
  NVDA: finnhubProvider,
  AMZN: finnhubProvider,
  GOOGL: finnhubProvider,
  META: finnhubProvider,
  TSLA: finnhubProvider,
  AMD: finnhubProvider,
  SPY: finnhubProvider,
  QQQ: finnhubProvider,

  // CoinGecko — crypto (delayed ~1-2 min, no API key)
  BTCUSD: coinGeckoProvider,
  ETHUSD: coinGeckoProvider,

  // Frankfurter (BCE) — forex (EOD, no API key)
  EURUSD: frankfurterProvider,
  GBPUSD: frankfurterProvider,
  USDJPY: frankfurterProvider,
};

/** Registro candele: solo i 3 dataset locali forniscono serie storiche. */
const CANDLE_PROVIDERS: Partial<Record<string, CandleProvider>> = {
  SPX: localStaticProvider,
  XAUUSD: localStaticProvider,
  US10Y: localStaticProvider,
};

/**
 * Disponibilità dati per uno strumento: il registro `QUOTE_PROVIDERS` è
 * la fonte unica di verità — se il simbolo è registrato, il provider esiste.
 * `"soon"` = nessun provider, `"available"` = provider registrato (può
 * comunque ritornare `null` a runtime se il servizio esterno non risponde).
 */
export function getAssetAvailability(instrument: MarketInstrument): AssetAvailability {
  return QUOTE_PROVIDERS[instrument.symbol] ? "available" : "soon";
}

/** Ultima quotazione per un simbolo catalogo, o `null` se nessun provider la fornisce. */
export async function getAssetQuote(symbol: string): Promise<ProviderQuote | null> {
  return QUOTE_PROVIDERS[symbol]?.getQuote(symbol) ?? null;
}

/** Serie storica per un simbolo catalogo (solo asset locali), o `[]`. */
export async function getAssetCandles(symbol: string): Promise<MarketDataPoint[]> {
  const provider = CANDLE_PROVIDERS[symbol];
  if (!provider) return [];
  const candles = await provider.getCandles(symbol);
  return candles?.points ?? [];
}

/**
 * Quotazione per uno strumento del catalogo Markets, o `null` per gli
 * strumenti `"soon"` senza provider.
 */
export async function getInstrumentQuote(instrument: MarketInstrument): Promise<ProviderQuote | null> {
  return getAssetQuote(instrument.symbol);
}

/**
 * Tutte le quotazioni disponibili (locale + Finnhub + CoinGecko + Frankfurter)
 * in parallelo via `Promise.all`. Next.js ISR cache evita richieste ridondanti.
 */
export async function getAllAssetQuotes(): Promise<ProviderQuote[]> {
  const symbols = Object.keys(QUOTE_PROVIDERS);
  const quotes = await Promise.all(symbols.map((s) => getAssetQuote(s)));
  return quotes.filter((q): q is ProviderQuote => q !== null);
}
