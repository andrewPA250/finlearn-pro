import { getAllAssetQuotes } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MarketsView } from "@/components/markets/MarketsView";

export default async function MarketsPage() {
  const tickerQuotes = (await getAllAssetQuotes()).map(quoteFromProvider);

  return <MarketsView tickerQuotes={tickerQuotes} />;
}
