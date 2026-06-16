"use client";

import { useState } from "react";
import type { MarketCategory, MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { MarketListSection } from "@/components/markets/MarketListSection";

interface MarketsFilterProps {
  categories: MarketCategory[];
  instrumentsByCategory: Record<string, MarketInstrument[]>;
  quotesBySymbol: Record<string, TickerQuote>;
}

const TABS = [
  { id: "all",       label: "All"         },
  { id: "equity",    label: "Stocks"      },
  { id: "crypto",    label: "Crypto"      },
  { id: "index",     label: "Indices"     },
  { id: "etf",       label: "ETFs"        },
  { id: "commodity", label: "Commodities" },
  { id: "forex",     label: "Forex"       },
  { id: "bond",      label: "Bonds"       },
];

export function MarketsFilter({
  categories,
  instrumentsByCategory,
  quotesBySymbol,
}: MarketsFilterProps) {
  const [activeTab, setActiveTab] = useState("all");

  const visibleCategories =
    activeTab === "all"
      ? categories
      : categories.filter((c) => c.id === activeTab);

  return (
    <div>
      {/* Quick filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition duration-150 ${
              activeTab === tab.id
                ? "bg-cyan text-bg-primary font-semibold"
                : "bg-bg-hover text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category sections grid */}
      <div
        id="overview"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visibleCategories.map((category) => {
          const instruments = instrumentsByCategory[category.id] ?? [];
          if (instruments.length === 0) return null;
          return (
            <div key={category.id} id={category.id}>
              <MarketListSection
                category={category}
                instruments={instruments}
                quotesBySymbol={quotesBySymbol}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
