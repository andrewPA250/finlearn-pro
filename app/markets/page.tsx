import { getAllAssetQuotes } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MarketsView } from "@/components/markets/MarketsView";

export default function MarketsPage() {
  const tickerQuotes = getAllAssetQuotes().map(quoteFromProvider);

  return <MarketsView tickerQuotes={tickerQuotes} />;
}
