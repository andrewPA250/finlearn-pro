import type { MarketDataPoint } from "@/types/market";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import type { NewsResult } from "@/lib/assetNews";
import { computeMarketContext } from "@/lib/assetContext";
import { AssetHero } from "@/components/asset/AssetHero";
import { AssetOverviewSection } from "@/components/asset/AssetOverviewSection";
import { AssetChartSection } from "@/components/asset/AssetChartSection";
import { AssetStatsSection } from "@/components/asset/AssetStatsSection";
import { AssetAbout } from "@/components/asset/AssetAbout";
import { AssetKeyFacts } from "@/components/asset/AssetKeyFacts";
import { AssetMarketContext } from "@/components/asset/AssetMarketContext";
import { AssetLatestNews } from "@/components/asset/AssetLatestNews";
import { AssetLearnReferences } from "@/components/asset/AssetLearnReferences";

interface AssetViewProps {
  instrument: MarketInstrument;
  categoryLabel: string;
  quote: TickerQuote | null;
  candles: MarketDataPoint[];
  newsResult: NewsResult;
}

export function AssetView({ instrument, categoryLabel, quote, candles, newsResult }: AssetViewProps) {
  const context = computeMarketContext(
    quote?.value ?? null,
    quote?.stats ?? undefined,
    candles,
  );

  const hasContext =
    context.positionPct != null || context.trendVs200 != null;

  return (
    <div className="mx-auto flex max-w-platform flex-col gap-4 p-6">
      {/* Hero */}
      <AssetHero
        instrument={instrument}
        categoryLabel={categoryLabel}
        quote={quote}
      />

      <div className="grid animate-fade-in-up gap-4" style={{ animationDelay: "60ms" }}>
        {/* Overview */}
        <AssetOverviewSection instrument={instrument} categoryLabel={categoryLabel} quote={quote} />

        {/* Chart */}
        <AssetChartSection
          symbol={instrument.symbol}
          candles={candles.length > 0 ? candles : null}
          unit={quote?.unit ?? "index"}
          source={quote?.source ?? "local-static"}
          tvSymbol={instrument.tradingViewSymbol}
        />

        {/* About */}
        <AssetAbout symbol={instrument.symbol} category={instrument.category} />

        {/* 3-col: Stats · Key Facts · Market Context */}
        <div className="grid gap-4 sm:grid-cols-3">
          {quote?.stats ? (
            <AssetStatsSection stats={quote.stats} unit={quote.unit} />
          ) : null}

          <AssetKeyFacts symbol={instrument.symbol} category={instrument.category} />

          {hasContext ? (
            <AssetMarketContext context={context} unit={quote?.unit ?? "index"} />
          ) : null}
        </div>

        {/* 2-col: News · Learn */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AssetLatestNews newsResult={newsResult} assetName={instrument.name} />
          <AssetLearnReferences category={instrument.category} />
        </div>
      </div>
    </div>
  );
}
