import { getAssetQuote } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { DEFAULT_RIBBON_SYMBOLS } from "./ribbonAssets";
import type { TickerQuote } from "@/lib/market/ticker";

/**
 * Fetch all ribbon quotes in parallel.
 * Uses existing provider layer + caching.
 *
 * Returns a map of symbol → quote or null if unavailable.
 */
export async function getRibbonQuotes(): Promise<Record<string, TickerQuote | null>> {
  const results: Record<string, TickerQuote | null> = {};

  // Fetch all in parallel
  const promises = DEFAULT_RIBBON_SYMBOLS.map(async (symbol) => {
    try {
      const providerQuote = await getAssetQuote(symbol);
      const quote = providerQuote ? quoteFromProvider(providerQuote) : null;
      results[symbol] = quote;
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      results[symbol] = null;
    }
  });

  await Promise.all(promises);
  return results;
}
