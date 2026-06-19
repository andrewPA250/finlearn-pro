import type { MarketInstrument } from "@/types/markets";

interface AssetUnavailableProps {
  instrument: MarketInstrument;
  categoryLabel: string;
  reason?: "no_quote" | "provider_not_ready" | "symbol_not_supported";
}

export function AssetUnavailable({ instrument, categoryLabel, reason }: AssetUnavailableProps) {
  const reasonText = {
    no_quote: "Real-time quote data is not currently available for this asset.",
    provider_not_ready: "This asset is in our catalog but provider integration is not yet available.",
    symbol_not_supported: "This asset symbol is not supported by available data providers.",
  }[reason || "no_quote"];

  return (
    <div className="mx-auto flex max-w-platform flex-col gap-4 p-4 md:p-6">
      {/* Hero section with asset info but no quote */}
      <div className="rounded-card border border-bg-border/15 bg-bg-card/60 p-6">
        <div className="mb-3 flex items-end gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{instrument.name}</h1>
            <p className="text-xs text-text-secondary/60">{instrument.symbol}</p>
          </div>
          <span className="mb-1 rounded-full bg-cyan-bg/50 px-2 py-1 text-xs font-bold uppercase text-cyan">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Unavailable message */}
      <div className="rounded-card border border-bg-border/15 bg-bg-card/60 p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-text-secondary/10 p-2">
            <svg
              className="h-5 w-5 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-text-primary">Market Data Unavailable</h2>
            <p className="mt-1 text-sm text-text-secondary">{reasonText}</p>
            <p className="mt-3 text-xs text-text-secondary/60">
              We&apos;re working to expand provider coverage. Check back soon or view this asset on{" "}
              <a
                href="https://finance.yahoo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-cyan hover:underline"
              >
                Yahoo Finance
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Learn section still available */}
      <div className="rounded-card border border-bg-border/15 bg-bg-card/60 p-5">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Learn More
        </h2>
        <p className="text-sm text-text-secondary">
          {instrument.category === "equity" && "Explore fundamentals of stock investing."}
          {instrument.category === "etf" && "Learn about exchange-traded funds and diversification."}
          {instrument.category === "crypto" && "Discover the basics of cryptocurrency markets."}
          {instrument.category === "index" && "Understand how market indices track economy health."}
          {instrument.category === "forex" && "Learn about currency markets and exchange rates."}
          {instrument.category === "commodity" && "Explore how commodity prices affect your portfolio."}
          {instrument.category === "bond" && "Understand bonds and fixed-income investing."}
        </p>
        <a
          href="/lessons/1"
          className="mt-3 inline-block rounded-card border border-cyan/30 px-3 py-1.5 text-xs font-semibold text-cyan transition-colors hover:border-cyan/60 hover:bg-cyan-bg/20"
        >
          Go to Learn →
        </a>
      </div>
    </div>
  );
}
