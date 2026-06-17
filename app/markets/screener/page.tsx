import type { Metadata } from "next";
import { getAllAssetQuotes } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MARKET_INSTRUMENTS } from "@/lib/markets/catalog";
import { ScreenerView } from "@/components/markets/ScreenerView";

export const metadata: Metadata = {
  title: "Market Screener — FinanceHub Markets",
  description: "Discover and screen 313+ global assets by category, price, performance, and fundamentals.",
};

export default async function ScreenerPage() {
  const tickerQuotes = (await getAllAssetQuotes()).map(quoteFromProvider);

  const quotesBySymbol: Record<string, ReturnType<typeof quoteFromProvider>> = Object.fromEntries(
    tickerQuotes.map((quote) => [quote.id, quote])
  );

  return <ScreenerView instruments={MARKET_INSTRUMENTS} quotesBySymbol={quotesBySymbol} />;
}
