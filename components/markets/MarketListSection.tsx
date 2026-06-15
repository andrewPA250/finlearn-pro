import type { AssetId } from "@/types/market";
import type { MarketCategory, MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { MarketListRow } from "@/components/markets/MarketListRow";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface MarketListSectionProps {
  category: MarketCategory;
  instruments: MarketInstrument[];
  quotesByAssetId: Partial<Record<AssetId, TickerQuote>>;
}

/**
 * Sezione di categoria per la pagina Markets: header con il nome categoria
 * (+ badge "Soon" se nessuno strumento è ancora live) ed elenco righe
 * `MarketListRow`. Non assume un numero fisso di strumenti per categoria:
 * un futuro catalogo con decine/centinaia di righe per categoria richiede
 * solo di estendere `MARKET_INSTRUMENTS`, non di toccare questo componente.
 */
export function MarketListSection({ category, instruments, quotesByAssetId }: MarketListSectionProps) {
  if (instruments.length === 0) return null;

  const hasLive = instruments.some((instrument) => instrument.status === "live");

  return (
    <section className="rounded-card border border-bg-sidebar bg-bg-card">
      <header className="flex items-center justify-between border-b border-bg-sidebar px-4 py-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">{category.label}</h2>
        {!hasLive && <SoonBadge />}
      </header>
      <div className="divide-y divide-bg-sidebar/60">
        {instruments.map((instrument) => (
          <MarketListRow
            key={instrument.symbol}
            instrument={instrument}
            quote={instrument.assetId ? quotesByAssetId[instrument.assetId] : undefined}
          />
        ))}
      </div>
    </section>
  );
}
