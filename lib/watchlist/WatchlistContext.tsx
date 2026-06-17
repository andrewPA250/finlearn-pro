"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  loadWatchlist,
  addToWatchlist as addToWatchlistStore,
  removeFromWatchlist as removeFromWatchlistStore,
  isInWatchlist as isInWatchlistStore,
} from "./watchlistStore";

interface WatchlistContextType {
  symbols: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  toggleWatchlist: (symbol: string) => void;
  clearWatchlist: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const loaded = loadWatchlist();
    setSymbols(loaded);
    setIsHydrated(true);
  }, []);

  const handleAddToWatchlist = (symbol: string) => {
    const updated = addToWatchlistStore(symbol);
    setSymbols(updated);
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    const updated = removeFromWatchlistStore(symbol);
    setSymbols(updated);
  };

  const handleIsInWatchlist = (symbol: string): boolean => {
    return isInWatchlistStore(symbol);
  };

  const handleToggleWatchlist = (symbol: string) => {
    if (handleIsInWatchlist(symbol)) {
      handleRemoveFromWatchlist(symbol);
    } else {
      handleAddToWatchlist(symbol);
    }
  };

  const handleClearWatchlist = () => {
    setSymbols([]);
    // Clear localStorage
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("financehub:watchlist");
      }
    } catch {}
  };

  // During SSR, return null to prevent hydration mismatch
  if (!isHydrated) {
    return <>{children}</>;
  }

  const value: WatchlistContextType = {
    symbols,
    addToWatchlist: handleAddToWatchlist,
    removeFromWatchlist: handleRemoveFromWatchlist,
    isInWatchlist: handleIsInWatchlist,
    toggleWatchlist: handleToggleWatchlist,
    clearWatchlist: handleClearWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistContextType {
  const context = useContext(WatchlistContext);

  // During SSR/static generation, return safe default
  if (!context) {
    const defaultContext: WatchlistContextType = {
      symbols: [],
      addToWatchlist: () => {},
      removeFromWatchlist: () => {},
      isInWatchlist: () => false,
      toggleWatchlist: () => {},
      clearWatchlist: () => {},
    };
    return defaultContext;
  }

  return context;
}
