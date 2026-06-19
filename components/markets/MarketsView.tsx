import type { TickerQuote } from "@/lib/market/ticker";
import { MARKET_CATEGORIES, getInstrumentsByCategory, getCatalogStats } from "@/lib/markets/catalog";
import { MarketsSidebar } from "@/components/markets/MarketsSidebar";
import { MarketsTopMovers } from "@/components/markets/MarketsTopMovers";
import { MarketsFilter } from "@/components/markets/MarketsFilter";

interface MarketsViewProps {
  tickerQuotes: TickerQuote[];
}

export function MarketsView({ tickerQuotes }: MarketsViewProps) {
  const quotesBySymbol: Record<string, TickerQuote> = Object.fromEntries(
    tickerQuotes.map((quote) => [quote.id, quote])
  );

  const catalogStats = getCatalogStats();

  // Build instruments map per category once (passed to client filter component)
  const instrumentsByCategory: Record<string, ReturnType<typeof getInstrumentsByCategory>> = {};
  for (const cat of MARKET_CATEGORIES) {
    instrumentsByCategory[cat.id] = getInstrumentsByCategory(cat.id);
  }

  return (
    <div className="mx-auto max-w-platform px-4 py-5 lg:px-6">
      {/* Page header */}
      <div className="mb-4 flex items-baseline justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Markets</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {catalogStats.total}+ assets across indices, equities, crypto, forex, commodities and bonds.
          </p>
        </div>
      </div>

      {/* Layout: sidebar + main */}
      <div className="flex gap-5 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
        {/* Context sidebar — desktop only */}
        <MarketsSidebar />

        {/* Main content */}
        <div className="min-w-0 flex-1 flex flex-col gap-4">
          {/* Top Movers snapshot */}
          <MarketsTopMovers quotes={tickerQuotes} />

          {/* Filterable category grid */}
          <MarketsFilter
            categories={MARKET_CATEGORIES}
            instrumentsByCategory={instrumentsByCategory}
            quotesBySymbol={quotesBySymbol}
          />
        </div>
      </div>
    </div>
  );
}
