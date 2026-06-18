import type { Metadata } from "next";
import { getAllAssetQuotes } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MarketsView } from "@/components/markets/MarketsView";

export const metadata: Metadata = {
  title: "Markets",
  description: "Explore 600+ global assets across stocks, ETFs, crypto, forex, commodities, and bonds with real-time market data.",
};

export default async function MarketsPage() {
  // Batched fetch with 30 concurrent limit + timeout protection
  const quotes = await getAllAssetQuotes(30);
  const tickerQuotes = quotes.map(quoteFromProvider);

  return <MarketsView tickerQuotes={tickerQuotes} />;
}
