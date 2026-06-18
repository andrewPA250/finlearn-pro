import { getRibbonQuotes } from "@/lib/markets/getRibbonQuotes";
import { getAssetNews } from "@/lib/assetNews";
import { LESSON_META } from "@/lib/lessonsMeta";
import { getCatalogStats } from "@/lib/markets/catalog";
import { HomePageContent } from "@/components/home/HomePageContent";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  const [quotes, newsResult] = await Promise.all([
    getRibbonQuotes(),
    getAssetNews("SPX", undefined, "index").catch(() => ({ topNews: [], allNews: [], source: "empty" as const, status: "error" as const })),
  ]);

  const catalogStats = getCatalogStats();
  const lessons = LESSON_META.slice(0, 4);
  const topNews = newsResult.topNews.slice(0, 4);

  return <HomePageContent quotes={quotes} catalogStats={catalogStats} lessons={lessons} topNews={topNews} />;
}
