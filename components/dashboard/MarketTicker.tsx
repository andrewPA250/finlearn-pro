import type { TickerQuote } from "@/lib/market/ticker";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface MarketTickerProps {
  quotes: TickerQuote[];
}

function formatValue(quote: TickerQuote): string {
  if (quote.unit === "percent") {
    return `${quote.value.toFixed(2)}%`;
  }
  return quote.value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatChange(quote: TickerQuote): string {
  const sign = quote.change >= 0 ? "+" : "";
  if (quote.unit === "percent") {
    return `${sign}${quote.change.toFixed(2)} pp`;
  }
  return `${sign}${quote.changePercent.toFixed(2)}%`;
}

/**
 * Ticker strip "riga densa" per la Home: quotazioni reali (S&P 500, Oro,
 * US Treasury 10Y) da `public/data/*.json`, calcolate da `buildTickerQuotes`.
 * Itera sull'array `quotes` senza assumerne la lunghezza: un futuro catalogo
 * Markets con decine di asset richiede solo di estendere l'array, non di
 * modificare questo componente.
 */
export function MarketTicker({ quotes }: MarketTickerProps) {
  if (quotes.length === 0) return null;

  return (
    <div className="rounded-card border border-bg-sidebar bg-bg-card">
      <div className="flex items-center justify-between border-b border-bg-sidebar px-4 py-2.5">
        <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">Markets</p>
        <span className="flex items-center gap-1.5 text-xs text-text-secondary/60">
          Catalogo completo
          <SoonBadge />
        </span>
      </div>
      <div className="flex gap-1 overflow-x-auto px-2 py-2 sm:gap-2 sm:px-3">
        {quotes.map((quote) => {
          const positive = quote.change >= 0;

          return (
            <div
              key={quote.id}
              className="flex shrink-0 items-center gap-3 rounded-card px-3 py-2"
            >
              <span className="text-sm font-bold text-text-primary">{quote.label}</span>
              <span className="font-mono text-sm text-text-primary">{formatValue(quote)}</span>
              <span className={`font-mono text-xs font-bold ${positive ? "text-accent-green" : "text-error"}`}>
                {formatChange(quote)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
