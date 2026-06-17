import type { Metadata } from "next";
import { getAllAssetQuotes } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MARKET_INSTRUMENTS } from "@/lib/markets/catalog";
import { HeatmapView } from "@/components/markets/HeatmapView";

export const metadata: Metadata = {
  title: "Market Heatmap — FinanceHub Markets",
  description: "Real-time market heatmap visualization.",
};

export default async function HeatmapPage() {
  // Batched fetch with 30 concurrent limit + timeout protection
  const quotes = await getAllAssetQuotes(30);
  const tickerQuotes = quotes.map(quoteFromProvider);

  const quotesBySymbol: Record<string, ReturnType<typeof quoteFromProvider>> = Object.fromEntries(
    tickerQuotes.map((quote) => [quote.id, quote])
  );

  console.log(`[HeatmapPage] Loaded ${tickerQuotes.length}/${MARKET_INSTRUMENTS.length} quotes`);

  return <HeatmapView instruments={MARKET_INSTRUMENTS} quotesBySymbol={quotesBySymbol} />;
}
