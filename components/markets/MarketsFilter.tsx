"use client";

import { useState } from "react";
import Link from "next/link";
import type { MarketCategory, MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { MarketListRow } from "@/components/markets/MarketListRow";

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
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-4">
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

      {/* Category sections grid — show previews with "View all" links */}
      <div
        id="overview"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {visibleCategories.map((category) => {
          const allInstruments = instrumentsByCategory[category.id] ?? [];
          if (allInstruments.length === 0) return null;

          // Show only first 10 in preview
          const preview = allInstruments.slice(0, 10);
          const totalCount = allInstruments.length;

          return (
            <div key={category.id} id={category.id} className="flex flex-col">
              <section className="flex-1 rounded-card border border-bg-border/15 bg-bg-card/60 flex flex-col">
                {/* Header with category name and count */}
                <header className="flex items-baseline justify-between border-b border-bg-border/15 px-3 py-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-wide text-text-secondary">
                    {category.label}
                  </h2>
                  <p className="text-[10px] text-text-muted">
                    {totalCount} {totalCount === 1 ? "asset" : "assets"}
                  </p>
                </header>

                {/* Preview list (first 10 items) */}
                <div className="divide-y divide-bg-border/10 flex-1">
                  {preview.map((instrument) => (
                    <MarketListRow
                      key={instrument.symbol}
                      instrument={instrument}
                      quote={quotesBySymbol[instrument.symbol]}
                    />
                  ))}
                </div>

                {/* "View all" footer link — inside the card for a flush table edge */}
                {totalCount > 10 && (
                  <Link
                    href={`/markets/category/${category.id}`}
                    className="border-t border-bg-border/15 px-3 py-1.5 text-[11px] font-semibold text-cyan hover:text-cyan-light transition hover:bg-bg-hover"
                  >
                    View all {totalCount} →
                  </Link>
                )}
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
