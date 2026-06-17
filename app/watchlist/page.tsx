import type { Metadata } from "next";
import { getAllAssetQuotes } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MARKET_INSTRUMENTS } from "@/lib/markets/catalog";
import { WatchlistView } from "@/components/watchlist/WatchlistView";

export const metadata: Metadata = {
  title: "My Watchlist — FinanceHub",
  description: "Track your favorite assets with custom watchlists.",
};

export default async function WatchlistPage() {
  // Fetch all quotes
  const tickerQuotes = (await getAllAssetQuotes()).map(quoteFromProvider);

  const quotesBySymbol: Record<string, ReturnType<typeof quoteFromProvider>> = Object.fromEntries(
    tickerQuotes.map((quote) => [quote.id, quote])
  );

  // Create a map of instruments by symbol for quick lookup
  const instrumentsBySymbol: Record<string, (typeof MARKET_INSTRUMENTS)[0]> = Object.fromEntries(
    MARKET_INSTRUMENTS.map((inst) => [inst.symbol, inst])
  );

  return <WatchlistView quotesBySymbol={quotesBySymbol} instrumentsBySymbol={instrumentsBySymbol} />;
}
