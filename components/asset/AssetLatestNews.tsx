"use client";

import { useState } from "react";
import type { NewsResult, NewsItem } from "@/lib/assetNews";

interface AssetLatestNewsProps {
  newsResult: NewsResult;
  assetName: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAge(unixSeconds: number): string {
  if (unixSeconds <= 0) return "";
  const diffMs = Date.now() - unixSeconds * 1000;
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return "< 1h ago";
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

// ---------------------------------------------------------------------------
// Single news card
// ---------------------------------------------------------------------------

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-md border border-transparent p-2 transition-colors duration-100 hover:border-bg-border/20 hover:bg-white/[0.025]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {item.source && (
            <span className="text-[10px] font-bold text-cyan uppercase tracking-wide shrink-0">{item.source}</span>
          )}
          {item.source && item.datetime > 0 && <span className="h-0.5 w-0.5 rounded-full bg-text-disabled/60 shrink-0" />}
          {item.datetime > 0 && <span className="text-[10px] text-text-disabled truncate">{formatAge(item.datetime)}</span>}
        </div>
        <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-text-primary group-hover:text-cyan">
          {item.headline}
        </p>
      </div>
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          className="h-10 w-14 flex-shrink-0 rounded object-cover opacity-70"
          loading="lazy"
        />
      ) : null}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AssetLatestNews({ newsResult, assetName }: AssetLatestNewsProps) {
  const [expanded, setExpanded] = useState(false);

  const { topNews, allNews, status } = newsResult;
  const displayNews: NewsItem[] = expanded ? allNews : topNews;
  const hiddenCount = allNews.length - topNews.length;
  const hasMore = hiddenCount > 0;

  return (
    <section className="rounded-card border border-bg-border/15 bg-bg-card/60 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Latest News
        </h2>
        {allNews.length > 0 && (
          <span className="text-[10px] text-text-secondary/50">
            {allNews.length} article{allNews.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Body */}
      {status === "error" ? (
        <p className="mt-3 text-sm text-text-secondary">
          News temporarily unavailable. Please check back shortly.
        </p>
      ) : allNews.length === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">
          No recent news available for {assetName}.
        </p>
      ) : (
        <>
          <div className="mt-2 space-y-1 divide-y divide-bg-border/10">
            {displayNews.map((item) => (
              <div key={item.id} className="pt-1 first:pt-0">
                <NewsCard item={item} />
              </div>
            ))}
          </div>

          {/* Expand / Collapse toggle */}
          {hasMore && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 w-full rounded-md border border-bg-border/20 py-1.5 text-[11px] font-semibold text-text-secondary transition-colors duration-100 hover:border-cyan/30 hover:text-text-primary"
            >
              {expanded
                ? "Show less"
                : `View all ${allNews.length} articles →`}
            </button>
          )}
        </>
      )}

      <p className="mt-3 text-[10px] text-text-secondary/40">News provided by Finnhub</p>
    </section>
  );
}
