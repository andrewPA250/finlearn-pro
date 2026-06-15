import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteChange, formatQuoteValue } from "@/lib/market/ticker";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface MarketTickerProps {
  quotes: TickerQuote[];
  /**
   * "compact" (default): riga densa per la Home.
   * "full": fascia più ricca per la pagina Markets — stessi dati, mostra
   * anche la data dell'ultimo aggiornamento per ciascuna quotazione.
   */
  variant?: "compact" | "full";
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

/**
 * Ticker strip "riga densa": quotazioni reali (S&P 500, Oro, US Treasury
 * 10Y) da `public/data/*.json`, calcolate da `buildTickerQuotes`. Riusata
 * da Home (variant "compact") e Markets (variant "full"). Itera sull'array
 * `quotes` senza assumerne la lunghezza: un futuro catalogo Markets con
 * decine di asset richiede solo di estendere l'array, non di modificare
 * questo componente.
 */
export function MarketTicker({ quotes, variant = "compact" }: MarketTickerProps) {
  if (quotes.length === 0) return null;

  const full = variant === "full";

  return (
    <div className="rounded-card border border-bg-sidebar bg-bg-card">
      <div className="flex items-center justify-between border-b border-bg-sidebar px-4 py-2.5">
        <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
          {full ? "Live now" : "Markets"}
        </p>
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
              <span className="font-mono text-sm text-text-primary">{formatQuoteValue(quote)}</span>
              <span className={`font-mono text-xs font-bold ${positive ? "text-accent-green" : "text-error"}`}>
                {formatQuoteChange(quote)}
              </span>
              {full && (
                <span className="font-mono text-[11px] text-text-secondary/50">{formatDate(quote.date)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
