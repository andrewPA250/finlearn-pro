import type { MarketCategoryId } from "@/types/markets";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number; // Unix seconds
  image: string;
  relevanceScore: number;
}

export type NewsStatus = "live" | "cached" | "empty" | "error";

export interface NewsResult {
  topNews: NewsItem[];
  allNews: NewsItem[];
  /** Where the data originated this cache period */
  source: "live" | "empty";
  status: NewsStatus;
}

// ---------------------------------------------------------------------------
// Asset-level relevance keywords — primary name first
// ---------------------------------------------------------------------------

const ASSET_KEYWORDS: Partial<Record<string, string[]>> = {
  // Equities
  AAPL:  ["apple",     "iphone", "ipad", "mac", "app store", "tim cook", "ios"],
  MSFT:  ["microsoft", "azure", "windows", "office 365", "satya nadella", "copilot"],
  NVDA:  ["nvidia",    "gpu", "jensen huang", "h100", "blackwell", "cuda", "geforce"],
  TSLA:  ["tesla",     "elon musk", "electric vehicle", "cybertruck", "model 3", "model y"],
  AMZN:  ["amazon",    "aws", "prime", "alexa", "andy jassy"],
  GOOGL: ["google",    "alphabet", "youtube", "android", "gemini", "sundar pichai"],
  META:  ["meta",      "facebook", "instagram", "whatsapp", "zuckerberg", "threads"],
  AMD:   ["amd",       "ryzen", "radeon", "epyc", "lisa su"],
  PLTR:  ["palantir",  "alex karp"],

  // ETFs
  SPY:  ["spdr",        "s&p 500 etf", "spy etf"],
  QQQ:  ["invesco qqq", "nasdaq etf"],
  VOO:  ["vanguard s&p 500", "voo"],
  VTI:  ["vanguard total stock", "vti"],
  SCHD: ["schwab dividend", "schd"],
  AGG:  ["ishares aggregate bond", "agg"],
  BND:  ["vanguard total bond", "bnd"],

  // Indices
  SPX: ["s&p 500", "s&p500", "spx", "standard & poor"],
  NDX: ["nasdaq-100", "nasdaq 100", "ndx"],
  DJI: ["dow jones", "djia", "dow industrial"],
  RUT: ["russell 2000", "small cap index", "rut"],

  // Crypto
  BTCUSD: ["bitcoin", "btc",      "halving", "satoshi"],
  ETHUSD: ["ethereum", "eth",     "vitalik", "defi", "smart contract"],
  XRPUSD: ["xrp",      "ripple"],
  ADAUSD: ["cardano",  "ada"],

  // Forex
  EURUSD: ["euro",           "eur", "ecb", "eurozone", "european central bank"],
  GBPUSD: ["pound sterling", "gbp", "bank of england", "sterling"],
  USDJPY: ["yen",            "jpy", "bank of japan", "boj"],

  // Commodities
  XAUUSD: ["gold",        "xau", "bullion", "precious metal"],
  XAGUSD: ["silver",      "xag"],
  WTI:    ["crude oil",   "wti", "opec", "barrel"],
  NATGAS: ["natural gas", "henry hub", "lng"],

  // Bonds
  US10Y: ["10-year treasury", "10 year yield", "treasury yield", "federal reserve", "fed rate"],
  US30Y: ["30-year treasury", "30 year bond",  "long-term bond"],
  US02Y: ["2-year treasury",  "short-term rate", "fed funds"],
};

const CATEGORY_KEYWORDS: Record<MarketCategoryId, string[]> = {
  equity:    ["stock", "earnings", "revenue", "ipo", "dividend", "shares", "analyst", "upgrade", "downgrade"],
  etf:       ["etf", "fund", "index fund", "passive investing"],
  index:     ["market", "index", "benchmark", "wall street", "rally", "selloff"],
  crypto:    ["crypto", "blockchain", "defi", "token", "wallet", "cryptocurrency"],
  forex:     ["currency", "forex", "exchange rate", "central bank", "monetary policy"],
  commodity: ["commodity", "supply", "demand", "futures", "inflation"],
  bond:      ["treasury", "yield", "bond", "interest rate", "inflation", "rate hike"],
};

// ---------------------------------------------------------------------------
// Scoring — deterministic, no ML
// ---------------------------------------------------------------------------

export function scoreNewsItem(
  item: Pick<NewsItem, "headline" | "summary" | "datetime">,
  symbol: string,
  category: MarketCategoryId,
): number {
  const text = `${item.headline} ${item.summary ?? ""}`.toLowerCase();
  let score = 0;

  const assetKws = ASSET_KEYWORDS[symbol] ?? [];

  // Primary name match (+10)
  if (assetKws[0] && text.includes(assetKws[0])) score += 10;

  // Ticker/symbol match — strip trailing "USD" for crypto/forex/commodities
  const ticker =
    symbol.length > 4 && symbol.endsWith("USD")
      ? symbol.slice(0, -3).toLowerCase()
      : symbol.toLowerCase();
  if (ticker.length >= 2 && text.includes(ticker)) score += 6;

  // Additional asset keywords (+3, first match only)
  for (const kw of assetKws.slice(1)) {
    if (text.includes(kw)) { score += 3; break; }
  }

  // Category-level keywords (+2, first match only)
  const catKws = CATEGORY_KEYWORDS[category] ?? [];
  for (const kw of catKws) {
    if (text.includes(kw)) { score += 2; break; }
  }

  // Freshness bonus
  if (item.datetime > 0) {
    const ageH = (Date.now() - item.datetime * 1000) / 3_600_000;
    if (ageH < 2)       score += 5;
    else if (ageH < 12) score += 3;
    else if (ageH < 48) score += 1;
  }

  return score;
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

const BASE_URL = "https://finnhub.io/api/v1";
const TIMEOUT_MS = 900; // never block page render longer than ~1 s

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("FINNHUB_API_KEY not set");
  return key;
}

function dateRange(daysBack: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(Date.now() - daysBack * 86_400_000);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

async function timedFetch(url: string): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { signal: ctrl.signal, next: { revalidate: 300 } });
  } finally {
    clearTimeout(id);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRaw(raw: any[]): Omit<NewsItem, "relevanceScore">[] {
  return raw
    .filter((item) => item.headline && item.url)
    .slice(0, 20)
    .map((item) => ({
      id:       String(item.id ?? item.datetime ?? Math.random()),
      headline: item.headline as string,
      summary:  item.summary  ?? "",
      source:   item.source   ?? "",
      url:      item.url      as string,
      datetime: item.datetime ?? 0,
      image:    item.image    ?? "",
    }));
}

async function fetchCompanyNews(
  finnhubSymbol: string,
): Promise<Omit<NewsItem, "relevanceScore">[]> {
  const { from, to } = dateRange(14);
  const url = `${BASE_URL}/company-news?symbol=${finnhubSymbol}&from=${from}&to=${to}&token=${getApiKey()}`;
  const res = await timedFetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return normalizeRaw(Array.isArray(data) ? data : []);
}

async function fetchCategoryNews(
  cat: "crypto" | "forex" | "general",
): Promise<Omit<NewsItem, "relevanceScore">[]> {
  const url = `${BASE_URL}/news?category=${cat}&minId=0&token=${getApiKey()}`;
  const res = await timedFetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return normalizeRaw(Array.isArray(data) ? data : []);
}

function finnhubCat(category: MarketCategoryId): "crypto" | "forex" | "general" {
  if (category === "crypto") return "crypto";
  if (category === "forex")  return "forex";
  return "general";
}

// ---------------------------------------------------------------------------
// Main aggregator
// ---------------------------------------------------------------------------

const TOP_N = 5;

export async function aggregateNews(
  symbol: string,
  finnhubSymbol: string | undefined,
  category: MarketCategoryId,
): Promise<NewsResult> {
  let rawItems: Omit<NewsItem, "relevanceScore">[] = [];
  let status: NewsStatus = "empty";

  try {
    if (category === "equity" && finnhubSymbol) {
      rawItems = await fetchCompanyNews(finnhubSymbol);
      // Fall back to general if company-news returns nothing
      if (rawItems.length === 0) {
        rawItems = await fetchCategoryNews("general");
      }
    } else {
      rawItems = await fetchCategoryNews(finnhubCat(category));
    }
    status = rawItems.length > 0 ? "live" : "empty";
  } catch {
    status = "error";
  }

  // Score → sort by (relevance desc, freshness desc)
  const allNews: NewsItem[] = rawItems
    .map((item) => ({
      ...item,
      relevanceScore: scoreNewsItem(item, symbol, category),
    }))
    .sort((a, b) => {
      const diff = b.relevanceScore - a.relevanceScore;
      return diff !== 0 ? diff : b.datetime - a.datetime;
    });

  const topNews = allNews.slice(0, TOP_N);
  const source: "live" | "empty" = status === "live" ? "live" : "empty";

  return { topNews, allNews, source, status };
}
