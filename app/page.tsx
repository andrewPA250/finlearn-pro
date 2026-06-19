import { getRibbonQuotes } from "@/lib/markets/getRibbonQuotes";
import { getAssetNews } from "@/lib/assetNews";
import { LESSON_META } from "@/lib/lessonsMeta";
import { getCatalogStats } from "@/lib/markets/catalog";
import { fetchCalendarData } from "@/lib/calendar/calendarProvider";
import { HomePageContent } from "@/components/home/HomePageContent";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  const [quotes, newsResult, calendarData] = await Promise.all([
    getRibbonQuotes(),
    getAssetNews("SPX", undefined, "index").catch(() => ({ topNews: [], allNews: [], source: "empty" as const, status: "error" as const })),
    fetchCalendarData("week").catch(() => null),
  ]);

  const catalogStats = getCatalogStats();
  const lessons = LESSON_META;
  const topNews = newsResult.allNews.slice(0, 9);
  const upcomingEarnings = (calendarData?.earnings ?? []).slice(0, 5);

  return (
    <HomePageContent
      quotes={quotes}
      catalogStats={catalogStats}
      lessons={lessons}
      topNews={topNews}
      upcomingEarnings={upcomingEarnings}
    />
  );
}
