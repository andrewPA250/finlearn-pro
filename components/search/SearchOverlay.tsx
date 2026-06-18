"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildSearchSections, CATEGORY_BADGE_LABELS, type SearchResultItem } from "@/lib/search/searchIndex";
import { SearchIcon } from "@/components/layout/icons";
import { AssetLogo } from "@/components/ui/AssetLogo";
import { useWatchlist } from "@/lib/watchlist/WatchlistContext";
import { usePortfolio } from "@/lib/portfolio/PortfolioContext";
import type { MarketCategoryId } from "@/types/markets";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  learnHref: string;
}

// Category badge colors
const CATEGORY_BADGE_COLORS: Record<MarketCategoryId, string> = {
  equity:    "bg-blue-500/15 text-blue-400",
  etf:       "bg-purple-500/15 text-purple-400",
  crypto:    "bg-orange-500/15 text-orange-400",
  index:     "bg-cyan/15 text-cyan",
  forex:     "bg-yellow-500/15 text-yellow-400",
  commodity: "bg-amber-500/15 text-amber-400",
  bond:      "bg-green-500/15 text-green-400",
};

function CategoryBadge({ category }: { category: MarketCategoryId }) {
  const label = CATEGORY_BADGE_LABELS[category] ?? category;
  const colorClass = CATEGORY_BADGE_COLORS[category] ?? "bg-bg-hover text-text-muted";
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${colorClass}`}>
      {label}
    </span>
  );
}

// Quick action buttons shown on hover for asset results
interface QuickActionsProps {
  item: SearchResultItem;
  onClose: () => void;
}

function QuickActions({ item, onClose }: QuickActionsProps) {
  const router = useRouter();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { addHolding } = usePortfolio();


  if (item.type !== "asset" || !item.assetClass) return null;

  const inWatchlist = isInWatchlist(item.title);

  function handleWatchlist(e: React.MouseEvent) {
    e.stopPropagation();
    toggleWatchlist(item.title);
  }

  function handleAddPortfolio(e: React.MouseEvent) {
    e.stopPropagation();
    addHolding(item.title, 1, 0);
    onClose();
    router.push("/portfolio");
  }

  function handleCreateAlert(e: React.MouseEvent) {
    e.stopPropagation();
    onClose();
    router.push(`/alerts?new=${item.title}`);
  }

  function handleCompare(e: React.MouseEvent) {
    e.stopPropagation();
    onClose();
    router.push(`/analytics/compare?symbols=${item.title}`);
  }

  return (
    <div className="ml-2 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/row:opacity-100">
      <button
        type="button"
        onClick={handleWatchlist}
        title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition hover:bg-bg-hover ${
          inWatchlist ? "text-cyan" : "text-text-muted hover:text-text-secondary"
        }`}
      >
        {inWatchlist ? "★" : "☆"}
      </button>
      <button
        type="button"
        onClick={handleAddPortfolio}
        title="Add to Portfolio"
        className="rounded px-1.5 py-0.5 text-[10px] font-medium text-text-muted transition hover:bg-bg-hover hover:text-text-secondary"
      >
        + Portfolio
      </button>
      <button
        type="button"
        onClick={handleCreateAlert}
        title="Create Alert"
        className="rounded px-1.5 py-0.5 text-[10px] font-medium text-text-muted transition hover:bg-bg-hover hover:text-text-secondary"
      >
        🔔
      </button>
      <button
        type="button"
        onClick={handleCompare}
        title="Compare"
        className="rounded px-1.5 py-0.5 text-[10px] font-medium text-text-muted transition hover:bg-bg-hover hover:text-text-secondary"
      >
        ≈ Compare
      </button>
    </div>
  );
}

export function SearchOverlay({ open, onClose, learnHref }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const sections = useMemo(
    () =>
      buildSearchSections(query, {
        home: "/dashboard",
        learn: learnHref,
        workbench: "/workbench",
        profile: "/profile",
      }),
    [query, learnHref]
  );

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function navigateTo(item: SearchResultItem | undefined) {
    if (!item?.href) return;
    onClose();
    router.push(item.href);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (flatItems.length === 0 ? 0 : (i + 1) % flatItems.length));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (flatItems.length === 0 ? 0 : (i - 1 + flatItems.length) % flatItems.length));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      navigateTo(flatItems[activeIndex]);
    }
  }

  if (!open) return null;

  let renderedIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex justify-center px-4 pt-[12vh]" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close search"
        className="fixed inset-0 bg-bg-primary/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 h-fit w-full max-w-xl overflow-hidden rounded-card border border-bg-card bg-bg-sidebar shadow-2xl">
        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-bg-card px-4 py-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, lessons, assets..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 rounded px-1 text-xs text-text-muted hover:text-text-secondary"
            >
              ✕
            </button>
          )}
          <kbd className="shrink-0 rounded border border-text-secondary/20 px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {sections.map((section) => (
            <div key={section.id} className="mb-2 last:mb-0">
              <p className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-text-secondary/60">
                {section.title}
              </p>

              {section.items.length === 0 ? (
                <p className="px-3 py-2 text-sm text-text-secondary/60">{section.emptyMessage}</p>
              ) : (
                section.items.map((item) => {
                  renderedIndex += 1;
                  const isActive = renderedIndex === activeIndex;
                  const isAsset = item.type === "asset";

                  return (
                    // div instead of button so nested quick-action buttons are valid HTML
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={isActive}
                      tabIndex={0}
                      onMouseEnter={() => setActiveIndex(renderedIndex)}
                      onClick={() => navigateTo(item)}
                      onKeyDown={(e) => e.key === "Enter" && navigateTo(item)}
                      className={`group/row flex w-full cursor-pointer items-center gap-2.5 rounded-card px-3 py-2 text-left text-sm transition duration-150 ease-in-out ${
                        isActive
                          ? "bg-accent-purple/15 text-text-primary"
                          : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                      }`}
                    >
                      {/* Logo / icon */}
                      {isAsset && item.assetClass && (
                        <AssetLogo
                          symbol={item.title}
                          name={item.assetName ?? item.title}
                          category={item.assetClass}
                          size="sm"
                        />
                      )}

                      {/* Title + subtitle */}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={`truncate ${isActive ? "font-bold" : "font-medium"}`}>
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="truncate text-xs text-text-secondary/70">
                            {item.subtitle}
                          </span>
                        )}
                      </span>

                      {/* Category badge for assets */}
                      {isAsset && item.assetClass && (
                        <CategoryBadge category={item.assetClass} />
                      )}

                      {/* Quick actions (visible on hover) */}
                      {isAsset && (
                        <QuickActions item={item} onClose={onClose} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ))}

          {flatItems.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-text-secondary/60">No results</p>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-bg-card px-4 py-2 flex items-center gap-4 text-[10px] text-text-muted/60">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span><kbd className="font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
