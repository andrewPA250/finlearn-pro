import { unstable_cache } from "next/cache";
import type { MarketCategoryId } from "@/types/markets";
import { aggregateNews } from "@/lib/newsAggregator";

// Re-export types so consumers only import from this module
export type { NewsItem, NewsResult, NewsStatus } from "@/lib/newsAggregator";

/**
 * Cached news aggregation — 5-minute revalidation window.
 * Each (symbol, finnhubSymbol, category) gets its own cache entry.
 * On Finnhub timeout or failure the result has status "error" and empty arrays;
 * the page renders cleanly without blocking.
 */
export const getAssetNews = unstable_cache(
  async (
    symbol: string,
    finnhubSymbol: string | undefined,
    category: MarketCategoryId,
  ) => aggregateNews(symbol, finnhubSymbol, category),
  ["asset-news"],
  { revalidate: 300 },
);
