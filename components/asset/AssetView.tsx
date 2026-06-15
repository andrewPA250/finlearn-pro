import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { AssetHero } from "@/components/asset/AssetHero";
import { AssetOverviewSection } from "@/components/asset/AssetOverviewSection";
import { AssetSectionPlaceholder } from "@/components/asset/AssetSectionPlaceholder";

interface AssetViewProps {
  instrument: MarketInstrument;
  categoryLabel: string;
  quote: TickerQuote | null;
}

/**
 * Pagina asset (Step 10.7): hero (`AssetHero`) + Overview con i dati
 * disponibili + sezioni placeholder (Chart/Stats/News/Learn references), che
 * preparano la struttura definitiva per il futuro catalogo. Stessa
 * composizione per strumenti `"live"` e `"soon"`: solo i contenuti delle
 * singole sezioni cambiano in base ai dati disponibili.
 */
export function AssetView({ instrument, categoryLabel, quote }: AssetViewProps) {
  return (
    <div className="mx-auto flex max-w-platform flex-col gap-4 p-6">
      <AssetHero instrument={instrument} categoryLabel={categoryLabel} quote={quote} />

      <div className="grid animate-fade-in-up gap-4" style={{ animationDelay: "60ms" }}>
        <AssetOverviewSection instrument={instrument} categoryLabel={categoryLabel} quote={quote} />

        <div className="grid gap-4 sm:grid-cols-2">
          <AssetSectionPlaceholder
            title="Chart"
            description={`Grafico storico interattivo per ${instrument.symbol}, con timeframe e indicatori — in arrivo con il catalogo asset completo.`}
          />
          <AssetSectionPlaceholder
            title="Stats"
            description="Metriche chiave (variazione su periodo, range, volatilità) per questo strumento."
          />
          <AssetSectionPlaceholder
            title="News"
            description={`Notizie e aggiornamenti rilevanti per ${instrument.name}.`}
          />
          <AssetSectionPlaceholder
            title="Learn references"
            description="Lezioni del modulo Learn collegate ai concetti rilevanti per questo strumento."
          />
        </div>
      </div>
    </div>
  );
}
