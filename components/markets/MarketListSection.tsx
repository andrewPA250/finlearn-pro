import type { MarketCategory, MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { MarketListRow } from "@/components/markets/MarketListRow";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface MarketListSectionProps {
  category: MarketCategory;
  instruments: MarketInstrument[];
  quotesBySymbol: Record<string, TickerQuote>;
}

/**
 * Sezione di categoria per la pagina Markets: header con il nome categoria
 * (+ badge "Soon" se nessuno strumento è ancora live/delayed) ed elenco righe
 * `MarketListRow`. Le quotazioni sono indicizzate per simbolo catalogo.
 */
export function MarketListSection({ category, instruments, quotesBySymbol }: MarketListSectionProps) {
  if (instruments.length === 0) return null;

  const hasProvider = instruments.some((i) => i.status !== "soon");

  return (
    <section className="rounded-card border border-bg-border/15 bg-bg-card/60">
      <header className="flex items-center justify-between border-b border-bg-border/15 px-3 py-2">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-text-secondary">{category.label}</h2>
        {!hasProvider && <SoonBadge />}
      </header>
      <div className="divide-y divide-bg-border/10">
        {instruments.map((instrument) => (
          <MarketListRow
            key={instrument.symbol}
            instrument={instrument}
            quote={quotesBySymbol[instrument.symbol]}
          />
        ))}
      </div>
    </section>
  );
}
