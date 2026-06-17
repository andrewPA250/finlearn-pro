"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { PortfolioHolding } from "./types";
import {
  loadPortfolio,
  addHolding as addHoldingStore,
  updateHolding as updateHoldingStore,
  removeHolding as removeHoldingStore,
  clearPortfolio as clearPortfolioStore,
} from "./portfolioStore";

interface PortfolioContextType {
  holdings: PortfolioHolding[];
  isHydrated: boolean;
  addHolding: (symbol: string, quantity: number, avgPrice: number, notes?: string) => void;
  updateHolding: (id: string, quantity: number, avgPrice: number, notes?: string) => void;
  removeHolding: (id: string) => void;
  clearPortfolio: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setHoldings(loadPortfolio());
    setIsHydrated(true);
  }, []);

  const value: PortfolioContextType = {
    holdings,
    isHydrated,
    addHolding: (symbol, quantity, avgPrice, notes) => {
      setHoldings(addHoldingStore(symbol, quantity, avgPrice, notes));
    },
    updateHolding: (id, quantity, avgPrice, notes) => {
      setHoldings(updateHoldingStore(id, quantity, avgPrice, notes));
    },
    removeHolding: (id) => {
      setHoldings(removeHoldingStore(id));
    },
    clearPortfolio: () => {
      clearPortfolioStore();
      setHoldings([]);
    },
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioContextType {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    return {
      holdings: [],
      isHydrated: false,
      addHolding: () => {},
      updateHolding: () => {},
      removeHolding: () => {},
      clearPortfolio: () => {},
    };
  }
  return ctx;
}
