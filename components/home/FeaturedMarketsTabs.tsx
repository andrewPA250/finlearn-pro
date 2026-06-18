"use client";

import { useState } from "react";
import Link from "next/link";
import type { TickerQuote } from "@/lib/market/ticker";
import { useCurrency } from "@/lib/currency/CurrencyContext";

interface FeaturedMarketsTabsProps {
  quotes: Record<string, TickerQuote | null>;
}

type TabId = "trending" | "stocks" | "crypto" | "etfs" | "indices";

const TABS: { id: TabId; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "stocks",   label: "Stocks" },
  { id: "crypto",   label: "Crypto" },
  { id: "etfs",     label: "ETFs" },
  { id: "indices",  label: "Indices" },
];

const TAB_SYMBOLS: Record<TabId, { symbol: string; name: string }[]> = {
  trending: [
    { symbol: "NVDA",   name: "NVIDIA" },
    { symbol: "TSLA",   name: "Tesla" },
    { symbol: "AAPL",   name: "Apple" },
    { symbol: "BTCUSD", name: "Bitcoin" },
    { symbol: "XAUUSD", name: "Gold" },
    { symbol: "MSFT",   name: "Microsoft" },
  ],
  stocks: [
    { symbol: "AAPL", name: "Apple" },
    { symbol: "NVDA", name: "NVIDIA" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "TSLA", name: "Tesla" },
  ],
  crypto: [
    { symbol: "BTCUSD", name: "Bitcoin" },
    { symbol: "ETHUSD", name: "Ethereum" },
  ],
  etfs: [
    { symbol: "QQQ", name: "Nasdaq 100 ETF" },
  ],
  indices: [
    { symbol: "SPX", name: "S&P 500" },
    { symbol: "NDX", name: "Nasdaq 100" },
    { symbol: "DJI", name: "Dow Jones" },
    { symbol: "VIX", name: "Volatility" },
  ],
};

function formatChange(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function AssetCard({ symbol, name, quote }: { symbol: string; name: string; quote: TickerQuote | null }) {
  const { formatMoneyCompact } = useCurrency();
  if (!quote) return null;

  const isPositive = quote.changePercent >= 0;

  return (
    <Link href={`/asset/${symbol}`}>
      <div className="group rounded-card border border-bg-border bg-bg-card p-4 transition-all duration-150 hover:border-cyan/30 hover:bg-bg-hover cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-bold text-text-primary font-mono">{symbol}</p>
            <p className="text-[11px] text-text-muted mt-0.5">{name}</p>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
            isPositive
              ? "bg-positive/10 text-positive"
              : "bg-negative/10 text-negative"
          }`}>
            {formatChange(quote.changePercent)}
          </span>
        </div>
        <p className="text-base font-bold text-text-primary font-mono">
          {quote.unit === "percent" ? `${quote.value.toFixed(2)}%` : formatMoneyCompact(quote.value)}
        </p>
      </div>
    </Link>
  );
}

export function FeaturedMarketsTabs({ quotes }: FeaturedMarketsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("trending");

  const assets = TAB_SYMBOLS[activeTab];
  const visibleAssets = assets.filter(({ symbol }) => quotes[symbol] != null);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-bg-border pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-all duration-150 border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-cyan text-cyan"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      {visibleAssets.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {assets.map(({ symbol, name }) => {
            const quote = quotes[symbol];
            if (!quote) return null;
            return (
              <AssetCard
                key={symbol}
                symbol={symbol}
                name={name}
                quote={quote}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted py-4">No data available for this category.</p>
      )}
    </div>
  );
}
