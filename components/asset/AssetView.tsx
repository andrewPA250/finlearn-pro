import type { MarketDataPoint } from "@/types/market";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { AssetHero } from "@/components/asset/AssetHero";
import { AssetOverviewSection } from "@/components/asset/AssetOverviewSection";
import { AssetChartSection } from "@/components/asset/AssetChartSection";
import { AssetSectionPlaceholder } from "@/components/asset/AssetSectionPlaceholder";
import { AssetStatsSection } from "@/components/asset/AssetStatsSection";

interface AssetViewProps {
  instrument: MarketInstrument;
  categoryLabel: string;
  quote: TickerQuote | null;
  candles: MarketDataPoint[];
}

export function AssetView({ instrument, categoryLabel, quote, candles }: AssetViewProps) {
  return (
    <div className="mx-auto flex max-w-platform flex-col gap-4 p-6">
      {/* Hero: always shows price from Yahoo Finance regardless of chart mode. */}
      <AssetHero
        instrument={instrument}
        categoryLabel={categoryLabel}
        quote={quote}
      />

      <div className="grid animate-fade-in-up gap-4" style={{ animationDelay: "60ms" }}>
        <AssetOverviewSection instrument={instrument} categoryLabel={categoryLabel} quote={quote} />

        {/* Chart: Synchronized (Yahoo/Recharts) by default; Advanced (TradingView)
            available when a validated TV symbol exists. Mode persisted in localStorage. */}
        <AssetChartSection
          symbol={instrument.symbol}
          candles={candles.length > 0 ? candles : null}
          unit={quote?.unit ?? "index"}
          source={quote?.source ?? "local-static"}
          tvSymbol={instrument.tradingViewSymbol}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {quote?.stats ? (
            <AssetStatsSection stats={quote.stats} unit={quote.unit} />
          ) : (
            <AssetSectionPlaceholder
              title="Stats"
              description="Metriche chiave (variazione su periodo, range, volatilità) per questo strumento."
            />
          )}
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
