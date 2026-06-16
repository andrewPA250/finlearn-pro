import type { TickerQuote } from "@/lib/market/ticker";
import { MARKET_CATEGORIES, getInstrumentsByCategory } from "@/lib/markets/catalog";
import { MarketTicker } from "@/components/dashboard/MarketTicker";
import { MarketListSection } from "@/components/markets/MarketListSection";

interface MarketsViewProps {
  tickerQuotes: TickerQuote[];
}

/**
 * Pagina Markets (Step 10.5): fascia "Live now" (ticker, variant "full") +
 * griglia di sezioni per categoria (Market List Pattern). Itera su
 * `MARKET_CATEGORIES`/`MARKET_INSTRUMENTS`: estendere il catalogo non
 * richiede modifiche a questo componente.
 */
export function MarketsView({ tickerQuotes }: MarketsViewProps) {
  const quotesBySymbol: Record<string, TickerQuote> = Object.fromEntries(
    tickerQuotes.map((quote) => [quote.id, quote])
  );

  return (
    <div className="mx-auto flex max-w-platform flex-col gap-6 p-6">
      <div className="animate-fade-in-up">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-purple">FinanceHub</p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">Markets</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Indici, azioni, ETF, crypto, forex, commodities e bond in un unico posto.
        </p>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <MarketTicker quotes={tickerQuotes} variant="full" />
      </div>

      <div className="grid animate-fade-in-up gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ animationDelay: "120ms" }}>
        {MARKET_CATEGORIES.map((category) => (
          <MarketListSection
            key={category.id}
            category={category}
            instruments={getInstrumentsByCategory(category.id)}
            quotesBySymbol={quotesBySymbol}
          />
        ))}
      </div>
    </div>
  );
}
