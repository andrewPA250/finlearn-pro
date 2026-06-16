import type { MarketDataPoint } from "@/types/market";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import type { NewsResult } from "@/lib/assetNews";
import type { ProviderFundamentals } from "@/lib/providers/types";
import { computeMarketContext } from "@/lib/assetContext";
import { AssetHero } from "@/components/asset/AssetHero";
import { AssetOverviewSection } from "@/components/asset/AssetOverviewSection";
import { AssetChartSection } from "@/components/asset/AssetChartSection";
import { AssetStatsSection } from "@/components/asset/AssetStatsSection";
import { AssetFundamentals } from "@/components/asset/AssetFundamentals";
import { AssetMarketContext } from "@/components/asset/AssetMarketContext";
import { AssetAbout } from "@/components/asset/AssetAbout";
import { AssetKeyFacts } from "@/components/asset/AssetKeyFacts";
import { AssetLatestNews } from "@/components/asset/AssetLatestNews";
import { AssetLearnReferences } from "@/components/asset/AssetLearnReferences";

interface AssetViewProps {
  instrument: MarketInstrument;
  categoryLabel: string;
  quote: TickerQuote | null;
  candles: MarketDataPoint[];
  newsResult: NewsResult;
  fundamentals: ProviderFundamentals | null;
}

export function AssetView({ instrument, categoryLabel, quote, candles, newsResult, fundamentals }: AssetViewProps) {
  const context = computeMarketContext(
    quote?.value ?? null,
    quote?.stats ?? undefined,
    candles,
  );

  const hasContext =
    context.positionPct != null || context.trendVs200 != null;

  return (
    <div className="mx-auto flex max-w-platform flex-col gap-4 p-6">
      {/* 1 — Hero */}
      <AssetHero
        instrument={instrument}
        categoryLabel={categoryLabel}
        quote={quote}
      />

      <div className="grid animate-fade-in-up gap-4" style={{ animationDelay: "60ms" }}>
        {/* 2 — Overview */}
        <AssetOverviewSection instrument={instrument} categoryLabel={categoryLabel} quote={quote} />

        {/* 3 — Chart */}
        <AssetChartSection
          symbol={instrument.symbol}
          candles={candles.length > 0 ? candles : null}
          unit={quote?.unit ?? "index"}
          source={quote?.source ?? "local-static"}
          tvSymbol={instrument.tradingViewSymbol}
        />

        {/* 4 — Stats */}
        {quote?.stats ? (
          <AssetStatsSection stats={quote.stats} unit={quote.unit} />
        ) : null}

        {/* 5 — Fundamentals */}
        {fundamentals ? (
          <AssetFundamentals fundamentals={fundamentals} category={instrument.category} />
        ) : null}

        {/* 6 — Market Context */}
        {hasContext ? (
          <AssetMarketContext context={context} unit={quote?.unit ?? "index"} />
        ) : null}

        {/* 7 — About */}
        <AssetAbout symbol={instrument.symbol} category={instrument.category} />

        {/* 8 — Key Facts */}
        <AssetKeyFacts symbol={instrument.symbol} category={instrument.category} />

        {/* 9+10 — News · Learn */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AssetLatestNews newsResult={newsResult} assetName={instrument.name} />
          <AssetLearnReferences category={instrument.category} />
        </div>
      </div>
    </div>
  );
}
