import { LESSON_META } from "@/lib/lessonsMeta";
import { MARKET_CATEGORIES, MARKET_INSTRUMENTS } from "@/lib/markets/catalog";
import type { MarketCategoryId, MarketInstrumentStatus } from "@/types/markets";

export type SearchResultType = "nav" | "lesson" | "asset";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href?: string;
  assetClass?: MarketCategoryId;
  assetName?: string;
  /** Present only for `type: "asset"`: catalog status. */
  assetStatus?: MarketInstrumentStatus;
}

export interface SearchSection {
  id: string;
  title: string;
  items: SearchResultItem[];
  emptyMessage?: string;
}

interface NavDestinations {
  home: string;
  learn: string;
  workbench: string;
  profile: string;
}

const MAX_ASSET_RESULTS = 20;

const CATEGORY_LABELS: Partial<Record<MarketCategoryId, string>> = Object.fromEntries(
  MARKET_CATEGORIES.map((c) => [c.id, c.label])
);

// Human-readable badge labels for category chips in search results
export const CATEGORY_BADGE_LABELS: Record<MarketCategoryId, string> = {
  equity:    "Stock",
  etf:       "ETF",
  crypto:    "Crypto",
  index:     "Index",
  forex:     "Forex",
  commodity: "Commodity",
  bond:      "Bond",
};

function getNavItems({ home, learn, workbench, profile }: NavDestinations): SearchResultItem[] {
  return [
    { id: "nav-home",      type: "nav", title: "Home",       href: home },
    { id: "nav-learn",     type: "nav", title: "Learn",      subtitle: "Continue learning path", href: learn },
    { id: "nav-workbench", type: "nav", title: "Workbench",  subtitle: "Interactive chart",       href: workbench },
    { id: "nav-profile",   type: "nav", title: "Profile",    href: profile },
    { id: "nav-markets",   type: "nav", title: "Markets",    href: "/markets" },
    { id: "nav-portfolio", type: "nav", title: "Portfolio",  href: "/portfolio" },
    { id: "nav-alerts",    type: "nav", title: "Alerts",     href: "/alerts" },
    { id: "nav-calendar",  type: "nav", title: "Calendar",   href: "/calendar" },
    { id: "nav-news",      type: "nav", title: "News",       href: "/news" },
    { id: "nav-watchlist", type: "nav", title: "Watchlist",  href: "/watchlist" },
  ];
}

function getLessonItems(): SearchResultItem[] {
  return LESSON_META.map((lesson) => ({
    id: `lesson-${lesson.id}`,
    type: "lesson",
    title: `Lesson ${lesson.id} — ${lesson.title}`,
    subtitle: lesson.keyConcept,
    href: `/lessons/${lesson.id}`,
  }));
}

// Pre-build asset items once (catalog is static at build time)
const ALL_ASSET_ITEMS: SearchResultItem[] = MARKET_INSTRUMENTS.map((instrument) => ({
  id: `asset-${instrument.symbol}`,
  type: "asset",
  title: instrument.symbol,
  subtitle: `${instrument.name} · ${CATEGORY_LABELS[instrument.category] ?? instrument.category}`,
  href: `/asset/${instrument.symbol}`,
  assetClass: instrument.category,
  assetName: instrument.name,
  assetStatus: instrument.status,
}));

/** Score an asset item for a given query — higher is better. */
function scoreAsset(item: SearchResultItem, q: string): number {
  const sym = item.title.toLowerCase();
  const name = (item.assetName ?? "").toLowerCase();

  if (sym === q)                      return 100; // exact symbol match
  if (sym.startsWith(q))              return 80;  // symbol prefix
  if (name.startsWith(q))             return 60;  // name prefix
  if (sym.includes(q))                return 40;  // symbol contains
  if (name.includes(q))               return 20;  // name contains
  // Subtitle covers category labels — fuzzy last
  const sub = (item.subtitle ?? "").toLowerCase();
  if (sub.includes(q))                return 5;
  return 0;
}

function matchesQuery(item: SearchResultItem, query: string): boolean {
  const haystack = `${item.title} ${item.subtitle ?? ""}`.toLowerCase();
  return haystack.includes(query);
}

export function buildSearchSections(query: string, destinations: NavDestinations): SearchSection[] {
  const q = query.trim().toLowerCase();

  const filterItems = (items: SearchResultItem[]) =>
    q === "" ? items : items.filter((item) => matchesQuery(item, q));

  // For assets with a query: rank by score, limit to MAX_ASSET_RESULTS
  const assetItems =
    q === ""
      ? ALL_ASSET_ITEMS.slice(0, MAX_ASSET_RESULTS)
      : ALL_ASSET_ITEMS
          .map((item) => ({ item, score: scoreAsset(item, q) }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, MAX_ASSET_RESULTS)
          .map(({ item }) => item);

  const sections: SearchSection[] = [
    {
      id: "go-to",
      title: "Go to",
      items: filterItems(getNavItems(destinations)),
    },
    {
      id: "lessons",
      title: "Lessons",
      items: filterItems(getLessonItems()),
    },
    {
      id: "assets",
      title: "Assets",
      items: assetItems,
      emptyMessage: "No assets found",
    },
  ];

  return sections.filter(
    (section) => section.items.length > 0 || section.emptyMessage !== undefined
  );
}
