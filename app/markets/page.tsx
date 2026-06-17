import { getAllAssetQuotes } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MarketsView } from "@/components/markets/MarketsView";

export default async function MarketsPage() {
  // Batched fetch with 30 concurrent limit + timeout protection
  const quotes = await getAllAssetQuotes(30);
  const tickerQuotes = quotes.map(quoteFromProvider);

  console.log(`[MarketsPage] Loaded ${tickerQuotes.length} quotes`);

  return <MarketsView tickerQuotes={tickerQuotes} />;
}
