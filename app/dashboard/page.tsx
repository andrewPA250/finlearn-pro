import { getAllAssetQuotes } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { getAssetNews } from "@/lib/assetNews";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const [rawQuotes, newsResult] = await Promise.all([
    getAllAssetQuotes(),
    getAssetNews("SPX", undefined, "index").catch(() => ({
      topNews: [],
      allNews: [],
      source: "empty" as const,
      status: "error" as const,
    })),
  ]);

  const tickerQuotes = rawQuotes.map(quoteFromProvider);

  return <DashboardView tickerQuotes={tickerQuotes} newsResult={newsResult} />;
}
