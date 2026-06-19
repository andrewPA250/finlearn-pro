"use client";

import { useEffect, useState } from "react";
import { useWatchlist } from "@/lib/watchlist/WatchlistContext";
import { WATCHLIST_MAX_SIZE } from "@/lib/watchlist/types";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";

interface WatchButtonProps {
  symbol: string;
}

export function WatchButton({ symbol }: WatchButtonProps) {
  const { isInWatchlist, toggleWatchlist, symbols } = useWatchlist();
  const { language } = useSettings();
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
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-card border border-bg-border/20 px-3 py-1.5 text-xs font-semibold text-text-disabled opacity-40"
      >
        {t("watch", language)}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={canAdd}
      title={
        canAdd
          ? `${t("watchlistFull", language)} (max ${WATCHLIST_MAX_SIZE})`
          : isWatched
          ? t("removeFromWatchlist", language)
          : t("addToWatchlist", language)
      }
      className={`inline-flex items-center gap-1.5 rounded-card border px-3 py-1.5 text-xs font-semibold transition duration-150 ${
        canAdd
          ? "cursor-not-allowed border-bg-border/20 text-text-disabled opacity-40"
          : isWatched
          ? "border-positive bg-positive/10 text-positive hover:bg-positive/20"
          : "border-bg-border/20 text-text-secondary hover:border-cyan/30 hover:text-cyan"
      }`}
    >
      {isWatched ? t("inWatchlist", language) : t("watch", language)}
    </button>
  );
}
