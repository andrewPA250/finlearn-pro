import { unstable_cache } from "next/cache";
import { aggregateNews } from "@/lib/newsAggregator";
import type { NewsItem } from "@/lib/assetNews";

const BROAD_SYMBOLS = [
  { symbol: "SPX", category: "index" as const },
  { symbol: "AAPL", category: "equity" as const },
  { symbol: "NVDA", category: "equity" as const },
  { symbol: "BTCUSD", category: "crypto" as const },
  { symbol: "XAUUSD", category: "commodity" as const },
  { symbol: "EURUSD", category: "forex" as const },
];

export interface GlobalNewsResult {
  news: NewsItem[];
  status: "live" | "error" | "empty";
}

/**
 * Fetch news from multiple symbols, merge, deduplicate by URL.
 * Cached for 5 minutes.
 */
export const getGlobalNews = unstable_cache(
  async (): Promise<GlobalNewsResult> => {
    const allNews: NewsItem[] = [];
    const seen = new Set<string>();

    for (const { symbol, category } of BROAD_SYMBOLS) {
      try {
        const result = await aggregateNews(symbol, undefined, category);
        if (result.allNews && result.allNews.length > 0) {
          for (const item of result.allNews) {
            if (!seen.has(item.url)) {
              seen.add(item.url);
              allNews.push(item);
            }
          }
        }
      } catch (err) {
        console.error(`Failed to fetch news for ${symbol}:`, err);
      }
    }

    // Sort by datetime descending (newest first)
    allNews.sort((a, b) => b.datetime - a.datetime);

    return {
      news: allNews,
      status: allNews.length > 0 ? "live" : "empty",
    };
  },
  ["global-news"],
  { revalidate: 300 }
);
