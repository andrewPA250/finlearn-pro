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

      {/* Category sections grid — show previews with "View all" links */}
      <div
        id="overview"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visibleCategories.map((category) => {
          const allInstruments = instrumentsByCategory[category.id] ?? [];
          if (allInstruments.length === 0) return null;

          // Show only first 10 in preview
          const preview = allInstruments.slice(0, 10);
          const totalCount = allInstruments.length;

          return (
            <div key={category.id} id={category.id} className="flex flex-col">
              <section className="flex-1 rounded-card border border-bg-sidebar bg-bg-card flex flex-col">
                {/* Header with category name and count */}
                <header className="border-b border-bg-sidebar px-4 py-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                    {category.label}
                  </h2>
                  <p className="mt-0.5 text-[10px] text-text-muted">
                    {totalCount} {totalCount === 1 ? "asset" : "assets"}
                  </p>
                </header>

                {/* Preview list (first 10 items) */}
                <div className="divide-y divide-bg-sidebar/60 flex-1">
                  {preview.map((instrument) => (
                    <MarketListRow
                      key={instrument.symbol}
                      instrument={instrument}
                      quote={quotesBySymbol[instrument.symbol]}
                    />
                  ))}
                </div>
              </section>

              {/* "View all" footer link */}
              {totalCount > 10 && (
                <Link
                  href={`/markets/category/${category.id}`}
                  className="mt-2 inline-flex items-center gap-1 rounded-card px-3 py-1.5 text-xs font-semibold text-cyan hover:text-cyan-light transition"
                >
                  View all {totalCount} →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
