import type { Metadata } from "next";
import { getAllAssetQuotes } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MARKET_INSTRUMENTS } from "@/lib/markets/catalog";
import { ScreenerView } from "@/components/markets/ScreenerView";

export const metadata: Metadata = {
  title: "Market Screener — FinanceHub Markets",
  description: "Discover and screen 600+ global assets by category, price, performance, and fundamentals.",
};

export default async function ScreenerPage() {
  // Batched fetch with 30 concurrent limit + timeout protection
  const quotes = await getAllAssetQuotes(30);
  const tickerQuotes = quotes.map(quoteFromProvider);

  const quotesBySymbol: Record<string, ReturnType<typeof quoteFromProvider>> = Object.fromEntries(
    tickerQuotes.map((quote) => [quote.id, quote])
  );

;

  return <ScreenerView instruments={MARKET_INSTRUMENTS} quotesBySymbol={quotesBySymbol} />;
}
