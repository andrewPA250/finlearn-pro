"use client";

import { useEffect, useState } from "react";
import { useWatchlist } from "@/lib/watchlist/WatchlistContext";
import { WATCHLIST_MAX_SIZE } from "@/lib/watchlist/types";

interface WatchButtonProps {
  symbol: string;
}

export function WatchButton({ symbol }: WatchButtonProps) {
  const { isInWatchlist, toggleWatchlist, symbols } = useWatchlist();
  const [hydrated, setHydrated] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    setIsWatched(isInWatchlist(symbol));
    setHydrated(true);
  }, [symbol, isInWatchlist]);

  const isFull = symbols.length >= WATCHLIST_MAX_SIZE;
  const canAdd = !isWatched && isFull;

  const handleClick = () => {
    if (canAdd) return; // Don't allow adding if full
    toggleWatchlist(symbol);
    setIsWatched(!isWatched);
  };

  if (!hydrated) {
    return (
      <button
        disabled
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-card border border-bg-border px-3 py-1.5 text-xs font-semibold text-text-disabled opacity-40"
      >
        ★ Watch
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={canAdd}
      title={
        canAdd
          ? `Watchlist full (max ${WATCHLIST_MAX_SIZE})`
          : isWatched
          ? "Remove from watchlist"
          : "Add to watchlist"
      }
      className={`inline-flex items-center gap-1.5 rounded-card border px-3 py-1.5 text-xs font-semibold transition duration-150 ${
        canAdd
          ? "cursor-not-allowed border-bg-border text-text-disabled opacity-40"
          : isWatched
          ? "border-positive bg-positive/10 text-positive hover:bg-positive/20"
          : "border-bg-border text-text-secondary hover:border-cyan/30 hover:text-cyan"
      }`}
    >
      {isWatched ? "✓ In Watchlist" : "★ Watch"}
    </button>
  );
}
