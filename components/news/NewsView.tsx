"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { NewsItem } from "@/lib/assetNews";
import { useSettings } from "@/lib/settings/SettingsContext";

type NewsCategory = "all" | "stocks" | "crypto" | "economy" | "commodities" | "etf";

const CATEGORY_KEYWORDS: Record<Exclude<NewsCategory, "all">, string[]> = {
  stocks: ["stock", "equity", "earnings", "revenue", "ipo", "dividend", "shares", "analyst", "upgrade", "downgrade", "s&p", "nasdaq", "dow"],
  crypto: ["crypto", "bitcoin", "ethereum", "btc", "eth", "blockchain", "defi", "token", "wallet"],
  economy: ["fed", "federal reserve", "inflation", "interest rate", "economic", "gdp", "employment", "unemployment"],
  commodities: ["gold", "oil", "crude", "natural gas", "commodity", "futures"],
  etf: ["etf", "fund", "index fund", "passive"],
};

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  all: "All",
  stocks: "Stocks",
  crypto: "Crypto",
  economy: "Macro",
  commodities: "Commodities",
  etf: "ETF",
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

    if (selectedCategory !== "all") {
      const keywords = CATEGORY_KEYWORDS[selectedCategory];
      result = result.filter((item) => {
        const text = `${item.headline} ${item.summary}`.toLowerCase();
        return keywords.some((kw) => text.includes(kw));
      });
    }

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
    <div className="mx-auto max-w-platform px-4 py-5 md:px-6">

      {/* Page header — terminal-style */}
      <div className="mb-5 animate-fade-in-up">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          {language === "it" ? "Intelligence" : "Market Intelligence"}
        </span>
        <h1 className="mt-0.5 text-xl font-bold text-text-primary">
          {language === "it" ? "Notizie di mercato" : "Market News"}
        </h1>
      </div>

      {/* Filters — compact horizontal layout */}
      <div
        className="mb-5 rounded-card border border-bg-border bg-bg-card px-4 py-3 animate-fade-in-up"
        style={{ animationDelay: "40ms" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="text"
            placeholder={language === "it" ? "Cerca titolo, fonte…" : "Search headline, source…"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded border border-bg-border bg-bg-primary px-3 py-1.5 text-sm text-text-primary placeholder-text-muted focus:border-cyan focus:outline-none"
          />
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {(["all", "stocks", "crypto", "economy", "commodities", "etf"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                  selectedCategory === cat
                    ? "bg-cyan text-bg-primary"
                    : "bg-bg-primary text-text-secondary hover:bg-bg-hover"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News feed */}
      {filtered.length === 0 ? (
        <div className="rounded-card border border-bg-border bg-bg-card p-8 text-center">
          <p className="text-text-secondary">
            {language === "it" ? "Nessuna notizia disponibile." : "No news available right now."}
          </p>
        </div>
      ) : (
        <div className="rounded-card border border-bg-border bg-bg-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          {filtered.map((item, idx) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex gap-4 p-4 transition-colors hover:bg-bg-hover ${idx < filtered.length - 1 ? "border-b border-bg-border/50" : ""}`}
            >
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Source + time row */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-cyan uppercase tracking-wide">{item.source}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-text-disabled/60 shrink-0" />
                  <span className="text-[10px] text-text-disabled">{formatDate(item.datetime)}</span>
                </div>
                {/* Headline */}
                <h3 className="mb-1 text-sm font-semibold text-text-primary group-hover:text-cyan transition-colors line-clamp-2 leading-snug">
                  {item.headline}
                </h3>
                {/* Summary */}
                {item.summary && (
                  <p className="text-xs text-text-secondary line-clamp-1 leading-relaxed">
                    {item.summary}
                  </p>
                )}
              </div>

              {/* Thumbnail — right side, smaller */}
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.headline}
                  width={96}
                  height={64}
                  unoptimized
                  className="h-16 w-24 flex-shrink-0 rounded-md object-cover opacity-70 self-start"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
