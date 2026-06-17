"use client";

import { useMemo, useState } from "react";
import type { NewsItem } from "@/lib/assetNews";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";

type NewsCategory = "all" | "stocks" | "crypto" | "economy" | "commodities" | "etf";

const CATEGORY_KEYWORDS: Record<Exclude<NewsCategory, "all">, string[]> = {
  stocks: ["stock", "equity", "earnings", "revenue", "ipo", "dividend", "shares", "analyst", "upgrade", "downgrade", "s&p", "nasdaq", "dow"],
  crypto: ["crypto", "bitcoin", "ethereum", "btc", "eth", "blockchain", "defi", "token", "wallet"],
  economy: ["fed", "federal reserve", "inflation", "interest rate", "economic", "gdp", "employment", "unemployment"],
  commodities: ["gold", "oil", "crude", "natural gas", "commodity", "futures"],
  etf: ["etf", "fund", "index fund", "passive"],
};

interface NewsViewProps {
  news: NewsItem[];
}

export function NewsView({ news }: NewsViewProps) {
  const { language } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("all");

  const filtered = useMemo(() => {
    let result = news;

    // Category filter
    if (selectedCategory !== "all") {
      const keywords = CATEGORY_KEYWORDS[selectedCategory];
      result = result.filter((item) => {
        const text = `${item.headline} ${item.summary}`.toLowerCase();
        return keywords.some((kw) => text.includes(kw));
      });
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((item) =>
        item.headline.toLowerCase().includes(search) ||
        item.source.toLowerCase().includes(search) ||
        item.summary.toLowerCase().includes(search)
      );
    }

    return result;
  }, [news, selectedCategory, searchTerm]);

  function formatDate(unixSeconds: number): string {
    if (!unixSeconds || unixSeconds <= 0) return "";
    const date = new Date(unixSeconds * 1000);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffH = Math.floor(diffMs / 3_600_000);

    if (diffH < 1) return "< 1h ago";
    if (diffH < 24) return `${diffH}h ago`;

    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="mx-auto max-w-platform px-4 py-6 md:px-6">
      {/* Page header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-text-primary">Market News</h1>
        <p className="mt-2 text-text-secondary">
          Latest market headlines across stocks, crypto, macro and commodities.
        </p>
      </div>

      {/* Filters + Search */}
      <div className="mb-6 rounded-card border border-border-base bg-bg-secondary p-4 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">
              {t("search", language)}
            </label>
            <input
              type="text"
              placeholder="Search headline, source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-border-base bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-cyan focus:outline-none"
            />
          </div>

          {/* Category filter chips */}
          <div>
            <p className="mb-2 text-xs font-medium text-text-secondary">Category</p>
            <div className="flex flex-wrap gap-2">
              {(["all", "stocks", "crypto", "economy", "commodities", "etf"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedCategory === cat
                      ? "bg-cyan text-bg-primary"
                      : "bg-bg-primary text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News cards */}
      {filtered.length === 0 ? (
        <div className="rounded-card border border-border-base bg-bg-secondary p-8 text-center">
          <p className="text-text-secondary">No news available right now.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          {filtered.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-card border border-border-base bg-bg-secondary p-4 transition hover:border-cyan/50 hover:bg-bg-hover"
            >
              <div className="flex gap-4">
                {/* Image */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.headline}
                    className="h-24 w-40 flex-shrink-0 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="mb-2 text-sm font-semibold text-text-primary group-hover:text-cyan transition line-clamp-2">
                    {item.headline}
                  </h3>

                  {item.summary && (
                    <p className="mb-3 text-xs text-text-secondary line-clamp-2">
                      {item.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    <span className="font-medium">{item.source}</span>
                    <span>•</span>
                    <span>{formatDate(item.datetime)}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
