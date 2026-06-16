import type { MarketDataPoint } from "@/types/market";
import type { MarketInstrument } from "@/types/markets";
import { localStaticProvider } from "./localStaticProvider";
import { finnhubProvider } from "./finnhubProvider";
import { coinGeckoProvider } from "./coinGeckoProvider";
import { frankfurterProvider } from "./frankfurterProvider";
import { yahooProvider, getAssetFundamentals } from "./yahooProvider";
import type { AssetAvailability, CandleProvider, ProviderQuote, QuoteProvider } from "./types";

export * from "./types";
export { localStaticProvider, finnhubProvider, coinGeckoProvider, frankfurterProvider, yahooProvider, getAssetFundamentals };

/**
 * Registro provider per simbolo catalogo (Step 12 architettura,
 * Step 13 Finnhub, Step 13.x CoinGecko + Frankfurter,
 * Step 13.2.2 Yahoo Finance — provider primario per tutti gli asset).
 *
 * Yahoo Finance è ora il provider primario per indici, azioni, ETF, crypto,
 * forex, commodities e bond. Finnhub/CoinGecko/Frankfurter restano nel
 * codebase ma non vengono più usati come provider primari.
 */
const QUOTE_PROVIDERS: Record<string, QuoteProvider> = {
  // Yahoo Finance — provider primario per tutti gli asset supportati
  // Indici
  SPX:    yahooProvider,
  NDX:    yahooProvider,
  DJI:    yahooProvider,
  RUT:    yahooProvider,
  // Azioni
  AAPL:   yahooProvider,
  MSFT:   yahooProvider,
  NVDA:   yahooProvider,
  AMZN:   yahooProvider,
  GOOGL:  yahooProvider,
  META:   yahooProvider,
  TSLA:   yahooProvider,
  AMD:    yahooProvider,
  PLTR:   yahooProvider,
  // ETF
  SPY:    yahooProvider,
  QQQ:    yahooProvider,
  VOO:    yahooProvider,
  VTI:    yahooProvider,
  SCHD:   yahooProvider,
  AGG:    yahooProvider,
  BND:    yahooProvider,
  // Crypto
  BTCUSD: yahooProvider,
  ETHUSD: yahooProvider,
  XRPUSD: yahooProvider,
  ADAUSD: yahooProvider,
  // Forex
  EURUSD: yahooProvider,
  GBPUSD: yahooProvider,
  USDJPY: yahooProvider,
  // Commodities
  XAUUSD: yahooProvider,
  XAGUSD: yahooProvider,
  WTI:    yahooProvider,
  NATGAS: yahooProvider,
  // Bond yields
  US10Y:  yahooProvider,
  US30Y:  yahooProvider,
};

/** Registro candele: tutti i provider che supportano serie storiche daily. */
const CANDLE_PROVIDERS: Partial<Record<string, CandleProvider>> = {
  // Yahoo Finance — storico daily da 2010 per tutti gli asset supportati
  SPX:    yahooProvider,
  NDX:    yahooProvider,
  DJI:    yahooProvider,
  RUT:    yahooProvider,
  AAPL:   yahooProvider,
  MSFT:   yahooProvider,
  NVDA:   yahooProvider,
  AMZN:   yahooProvider,
  GOOGL:  yahooProvider,
  META:   yahooProvider,
  TSLA:   yahooProvider,
  AMD:    yahooProvider,
  PLTR:   yahooProvider,
  SPY:    yahooProvider,
  QQQ:    yahooProvider,
  VOO:    yahooProvider,
  VTI:    yahooProvider,
  SCHD:   yahooProvider,
  AGG:    yahooProvider,
  BND:    yahooProvider,
  BTCUSD: yahooProvider,
  ETHUSD: yahooProvider,
  XRPUSD: yahooProvider,
  ADAUSD: yahooProvider,
  EURUSD: yahooProvider,
  GBPUSD: yahooProvider,
  USDJPY: yahooProvider,
  XAUUSD: yahooProvider,
  XAGUSD: yahooProvider,
  WTI:    yahooProvider,
  NATGAS: yahooProvider,
  US10Y:  yahooProvider,
  US30Y:  yahooProvider,
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
