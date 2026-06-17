import type { MarketDataPoint } from "@/types/market";
import type { MarketInstrument } from "@/types/markets";
import { MARKET_INSTRUMENTS } from "@/lib/markets/catalog";
import { localStaticProvider } from "./localStaticProvider";
import { finnhubProvider } from "./finnhubProvider";
import { coinGeckoProvider } from "./coinGeckoProvider";
import { frankfurterProvider } from "./frankfurterProvider";
import { yahooProvider, getAssetFundamentals } from "./yahooProvider";
import type { AssetAvailability, CandleProvider, ProviderQuote, QuoteProvider } from "./types";

export * from "./types";
export { localStaticProvider, finnhubProvider, coinGeckoProvider, frankfurterProvider, yahooProvider, getAssetFundamentals };

/**
 * Provider routing — **CATALOG-DRIVEN** (Phase 7A refactor)
 *
 * Instead of hardcoded provider maps, we build them dynamically from MARKET_INSTRUMENTS.
 * Any asset with yahooSymbol automatically routes to Yahoo for quote/candles.
 *
 * This eliminates the need to manually add every new asset to QUOTE_PROVIDERS
 * and CANDLE_PROVIDERS maps. Just add it to the catalog and it works.
 *
 * Yahoo Finance is the primary provider for indices, stocks, ETFs, crypto,
 * forex, commodities, and bonds. Finnhub/CoinGecko/Frankfurter remain in
 * the codebase but are not used as primary providers.
 */

// Build provider maps dynamically from catalog
function buildProviderMaps() {
  const quotes: Record<string, QuoteProvider> = {};
  const candles: Partial<Record<string, CandleProvider>> = {};

  for (const instrument of MARKET_INSTRUMENTS) {
    // If instrument has yahooSymbol, route to Yahoo
    if (instrument.yahooSymbol) {
      quotes[instrument.symbol] = yahooProvider;
      candles[instrument.symbol] = yahooProvider;
    }
  }

  return { quotes, candles };
}

const { quotes: QUOTE_PROVIDERS, candles: CANDLE_PROVIDERS } = buildProviderMaps();

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
