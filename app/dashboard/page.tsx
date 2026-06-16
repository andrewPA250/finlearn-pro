import { getAllAssetQuotes } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { LESSON_META } from "@/lib/lessons";

export default async function DashboardPage() {
  const tickerQuotes = (await getAllAssetQuotes()).map(quoteFromProvider);

  return <DashboardView lessonMeta={LESSON_META} tickerQuotes={tickerQuotes} />;
}
