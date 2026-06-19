import type { Metadata } from "next";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MARKET_INSTRUMENTS } from "@/lib/markets/catalog";
import { WatchlistView } from "@/components/watchlist/WatchlistView";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Track your favorite assets with custom watchlists.",
};

export default async function WatchlistPage() {
  // Create a map of instruments by symbol for quick lookup
  const instrumentsBySymbol: Record<string, (typeof MARKET_INSTRUMENTS)[0]> = Object.fromEntries(
    MARKET_INSTRUMENTS.map((inst) => [inst.symbol, inst])
  );

  // Watchlist is client-side managed, but if server-side watchlist items exist, fetch them
  // For now, just pass empty and let client manage
  const quotesBySymbol: Record<string, ReturnType<typeof quoteFromProvider>> = {};

  return <WatchlistView quotesBySymbol={quotesBySymbol} instrumentsBySymbol={instrumentsBySymbol} />;
}
