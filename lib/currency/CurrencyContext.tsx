"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSettings } from "@/lib/settings/SettingsContext";
import { formatMoney, formatMoneyCompact } from "@/lib/currency/index";
import type { Currency } from "@/lib/settings/types";
import type { TickerQuote } from "@/lib/market/ticker";

interface CurrencyContextValue {
  /** Format a USD-denominated value in the user's display currency. Returns "—" for missing data. */
  formatMoney: (usdValue: number | null | undefined) => string;
  /** Compact variant — omits decimals for large values (e.g. market cards). */
  formatMoneyCompact: (usdValue: number | null | undefined) => string;
  /** Whether a live FX rate is available for the chosen currency. Always true for USD. */
  fxAvailable: boolean;
  /** Short label shown near converted values, e.g. "Converted from USD". Null for USD. */
  fxLabel: string | null;
  currency: Currency;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { currency } = useSettings();
  const [rate, setRate] = useState<number>(1);
  const [fxAvailable, setFxAvailable] = useState<boolean>(true);
  const fetchedFor = useRef<string>("");

  useEffect(() => {
    if (currency === "USD") {
      setRate(1);
      setFxAvailable(true);
      fetchedFor.current = "USD";
      return;
    }

    // Skip re-fetch if we already have rates for this currency
    if (fetchedFor.current === currency) return;

    const fxSymbol = currency === "EUR" ? "EURUSD" : "GBPUSD";

    async function fetchRate() {
      try {
        const res = await fetch(`/api/quotes?symbols=${fxSymbol}`, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = (await res.json()) as Record<string, TickerQuote>;
        const quote = data[fxSymbol];
        if (quote && quote.value > 0) {
          // EURUSD = 1.08 means 1 EUR = 1.08 USD → USD→EUR = 1/1.08
          setRate(1 / quote.value);
          setFxAvailable(true);
          fetchedFor.current = currency;
        } else {
          setRate(1);
          setFxAvailable(false);
          fetchedFor.current = currency;
        }
      } catch {
        setRate(1);
        setFxAvailable(false);
        fetchedFor.current = currency;
      }
    }

    fetchRate();
  }, [currency]);

  const value: CurrencyContextValue = {
    formatMoney: (v) => formatMoney(v, currency, rate, fxAvailable),
    formatMoneyCompact: (v) => formatMoneyCompact(v, currency, rate, fxAvailable),
    fxAvailable: currency === "USD" ? true : fxAvailable,
    fxLabel: currency === "USD" ? null : fxAvailable ? "Converted from USD" : "FX unavailable, shown in USD",
    currency,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Fallback for components rendered outside provider (e.g. during SSR)
    return {
      formatMoney: (v) => formatMoney(v, "USD", 1, true),
      formatMoneyCompact: (v) => formatMoneyCompact(v, "USD", 1, true),
      fxAvailable: true,
      fxLabel: null,
      currency: "USD",
    };
  }
  return ctx;
}
