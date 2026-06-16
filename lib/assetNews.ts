import { unstable_cache } from "next/cache";
import type { MarketCategoryId } from "@/types/markets";

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number; // Unix timestamp (seconds)
  image: string;
}

const BASE_URL = "https://finnhub.io/api/v1";
const REVALIDATE_SECONDS = 300; // 5 minutes

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("FINNHUB_API_KEY is not configured");
  return key;
}

function dateRange(daysBack: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(Date.now() - daysBack * 86_400_000);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeItems(raw: any[]): NewsItem[] {
  return raw
    .filter((item) => item.headline && item.url)
    .map((item) => ({
      id: String(item.id ?? item.datetime ?? Math.random()),
      headline: item.headline as string,
      summary: item.summary ?? "",
      source: item.source ?? "",
      url: item.url as string,
      datetime: item.datetime ?? 0,
      image: item.image ?? "",
    }))
    .slice(0, 6);
}

async function fetchCompanyNews(finnhubSymbol: string): Promise<NewsItem[]> {
  const key = getApiKey();
  const { from, to } = dateRange(14);
  const url = `${BASE_URL}/company-news?symbol=${finnhubSymbol}&from=${from}&to=${to}&token=${key}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) return [];
  const data = await res.json();
  return normalizeItems(Array.isArray(data) ? data : []);
}

async function fetchCategoryNews(category: "crypto" | "forex" | "general" | "merger"): Promise<NewsItem[]> {
  const key = getApiKey();
  const url = `${BASE_URL}/news?category=${category}&minId=0&token=${key}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) return [];
  const data = await res.json();
  return normalizeItems(Array.isArray(data) ? data : []);
}

function finnhubCategory(category: MarketCategoryId): "crypto" | "forex" | "general" {
  if (category === "crypto") return "crypto";
  if (category === "forex") return "forex";
  return "general";
}

// ---------------------------------------------------------------------------
// Public cached fetchers
// ---------------------------------------------------------------------------

export const getAssetNews = unstable_cache(
  async (symbol: string, finnhubSymbol: string | undefined, category: MarketCategoryId): Promise<NewsItem[]> => {
    try {
      if (category === "equity" && finnhubSymbol) {
        const items = await fetchCompanyNews(finnhubSymbol);
        // Fallback to general if no company news available (e.g. weekend)
        if (items.length > 0) return items;
      }
      return await fetchCategoryNews(finnhubCategory(category));
    } catch {
      return [];
    }
  },
  ["asset-news"],
  { revalidate: REVALIDATE_SECONDS },
);
