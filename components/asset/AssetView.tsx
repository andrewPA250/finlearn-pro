import type { MarketDataPoint } from "@/types/market";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import type { NewsResult } from "@/lib/assetNews";
import type { ProviderFundamentals } from "@/lib/providers/types";
import { computeMarketContext } from "@/lib/assetContext";
import { AssetHero } from "@/components/asset/AssetHero";
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

const NAV_LINKS = [
  { id: "chart",        label: "Chart" },
  { id: "stats",        label: "Statistics" },
  { id: "fundamentals", label: "Fundamentals" },
  { id: "news",         label: "News" },
  { id: "learn",        label: "Learn" },
] as const;

export function AssetView({ instrument, categoryLabel, quote, candles, newsResult, fundamentals }: AssetViewProps) {
  const context = computeMarketContext(
    quote?.value ?? null,
    quote?.stats ?? undefined,
    candles,
  );

  const hasSMA = context.sma200 != null && context.trendVs200 != null;

  return (
    <div className="mx-auto max-w-platform">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-6">
        <AssetHero instrument={instrument} categoryLabel={categoryLabel} quote={quote} />
      </div>

      {/* ── Section nav ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-14 z-20 border-b border-bg-border/20 bg-bg-primary/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-platform items-center overflow-x-auto px-4 md:px-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="shrink-0 whitespace-nowrap border-b-2 border-transparent px-4 py-2.5 text-xs font-medium text-text-muted transition duration-150 hover:border-cyan/40 hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div
        className="flex flex-col gap-5 px-4 py-6 md:px-6 animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        {/* Chart */}
        <AssetChartSection
          symbol={instrument.symbol}
          candles={candles.length > 0 ? candles : null}
          quote={quote}
          unit={quote?.unit ?? "index"}
          source={quote?.source ?? "local-static"}
          tvSymbol={instrument.tradingViewSymbol}
          category={instrument.category}
        />

        {/* Statistics grid + 52W range bar */}
        {quote?.stats && (
          <AssetStatsSection
            stats={quote.stats}
            unit={quote.unit}
            currentPrice={quote.value}
          />
        )}

        {/* 200-Day SMA trend (only when candle history is sufficient) */}
        {hasSMA && (
          <AssetMarketContext context={context} unit={quote?.unit ?? "index"} />
        )}

        {/* Fundamentals + About/Facts side by side */}
        {fundamentals ? (
          <div id="fundamentals" className="grid gap-5 md:grid-cols-2">
            <AssetFundamentals fundamentals={fundamentals} category={instrument.category} />
            <div className="flex flex-col gap-5">
              <AssetAbout symbol={instrument.symbol} category={instrument.category} />
              <AssetKeyFacts symbol={instrument.symbol} category={instrument.category} />
            </div>
          </div>
        ) : (
          <div id="fundamentals" className="grid gap-5 sm:grid-cols-2">
            <AssetAbout symbol={instrument.symbol} category={instrument.category} />
            <AssetKeyFacts symbol={instrument.symbol} category={instrument.category} />
          </div>
        )}

        {/* News (2/3) + Learn (1/3) */}
        <div className="grid gap-5 md:grid-cols-3">
          <div id="news" className="md:col-span-2">
            <AssetLatestNews newsResult={newsResult} assetName={instrument.name} />
          </div>
          <div id="learn">
            <AssetLearnReferences category={instrument.category} />
          </div>
        </div>
      </div>
    </div>
  );
}
