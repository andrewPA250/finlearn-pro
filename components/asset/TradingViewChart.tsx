"use client";

import { useEffect, useRef } from "react";
import type { MarketCategoryId } from "@/types/markets";

// TradingView widget global — set by tv.js after load
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { TradingView: any }
}

// ---------------------------------------------------------------------------
// Symbol validation — instrument.tradingViewSymbol is the ONLY source of
// truth (no derivation from yahooSymbol, the app symbol, or any fallback).
// This function only decides whether that declared symbol is *embeddable*
// in TradingView's free public widget — it never invents or substitutes a
// different symbol.
//
// Trust model, by category:
//
// - index / bond / commodity: every catalog entry in these categories sets
//   tradingViewSymbol explicitly (no auto-derivation in catalog.ts), so the
//   value reflects deliberate research. These are trusted directly, with
//   one exception: continuous futures contracts ("...1!" notation, e.g.
//   COMEX:HG1!, CBOT:ZC1!) commonly require a TradingView real-time/Pro
//   data subscription and are the most common real-world cause of the
//   "this symbol is only available on TradingView" popup + silent fallback.
//   Those are excluded until manually confirmed embeddable.
// - forex (FX:XXXXXX) / crypto (BINANCE:XXXUSDT): deterministic, standard
//   TradingView data feeds, always public in the free widget. Trusted by
//   prefix.
// - equity / etf: exchange prefix correctness varies per ticker (e.g. a
//   stock can be NASDAQ- or NYSE-listed) and cannot be inferred from the
//   symbol string alone, so these are validated against an explicit,
//   manually-verified list. Anything not listed here shows the clean
//   "chart unavailable" fallback rather than risking an unverified guess.
// ---------------------------------------------------------------------------

const FUTURES_CONTINUOUS = /\d!$/;

/** Manually verified NASDAQ/NYSE/AMEX equity + ETF symbols — exchange-correct and confirmed embeddable. */
const VERIFIED_EQUITY_ETF_SYMBOLS = new Set([
  // Mega-cap equities (NASDAQ-listed)
  "NASDAQ:AAPL", "NASDAQ:MSFT", "NASDAQ:NVDA", "NASDAQ:AMZN",
  "NASDAQ:GOOGL", "NASDAQ:GOOG", "NASDAQ:META", "NASDAQ:TSLA", "NASDAQ:AMD",
  "NASDAQ:AVGO", "NASDAQ:NFLX", "NASDAQ:INTC", "NASDAQ:CSCO", "NASDAQ:QCOM",
  "NASDAQ:TXN", "NASDAQ:ADBE", "NASDAQ:COST", "NASDAQ:PEP", "NASDAQ:SBUX",
  "NASDAQ:AMAT", "NASDAQ:MU", "NASDAQ:LRCX", "NASDAQ:KLAC", "NASDAQ:PYPL",
  // Mega-cap equities (NYSE-listed)
  "NYSE:V", "NYSE:MA", "NYSE:BA", "NYSE:JPM", "NYSE:BAC", "NYSE:WFC",
  "NYSE:GS", "NYSE:MS", "NYSE:C", "NYSE:KO", "NYSE:MCD",
  "NYSE:NKE", "NYSE:WMT", "NYSE:PG", "NYSE:JNJ", "NYSE:UNH", "NYSE:HD",
  "NYSE:LOW", "NYSE:DIS", "NYSE:XOM", "NYSE:CVX", "NYSE:CAT", "NYSE:GE",
  "NYSE:LMT", "NYSE:RTX", "NYSE:DE", "NYSE:ORCL", "NYSE:CRM", "NYSE:IBM",
  "NYSE:SHOP", "NYSE:UBER", "NYSE:BRK/B", "NYSE:PLTR",
  // Core ETFs
  "AMEX:SPY", "NASDAQ:QQQ", "AMEX:VOO", "AMEX:VTI", "AMEX:SCHD",
  "AMEX:AGG", "AMEX:BND", "AMEX:GLD", "AMEX:SLV",
  "AMEX:XLK", "AMEX:XLF", "AMEX:XLE", "AMEX:XLV", "AMEX:XLY",
  "AMEX:XLI", "AMEX:XLP", "AMEX:XLB", "AMEX:XLU", "AMEX:XLRE", "AMEX:XLC",
  "AMEX:DIA", "AMEX:IWM",
]);

export function validateTradingViewSymbol(
  symbol: string | undefined,
  category?: MarketCategoryId
): boolean {
  if (!symbol) return false;
  if (FUTURES_CONTINUOUS.test(symbol)) return false;

  switch (category) {
    case "index":
    case "bond":
    case "commodity":
      return true;
    case "forex":
      return symbol.startsWith("FX:");
    case "crypto":
      return symbol.startsWith("BINANCE:") && symbol.endsWith("USDT");
    case "equity":
    case "etf":
      return VERIFIED_EQUITY_ETF_SYMBOLS.has(symbol);
    default:
      // No category supplied (legacy call site) — fall back to the
      // explicit equity/ETF list only, the most conservative option.
      return VERIFIED_EQUITY_ETF_SYMBOLS.has(symbol);
  }
}

// ---------------------------------------------------------------------------
// Script loader — tv.js is loaded once per page lifecycle via module-level promise
// ---------------------------------------------------------------------------
let scriptPromise: Promise<void> | null = null;

function loadTVScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    if (window.TradingView) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://s3.tradingview.com/tv.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface TradingViewChartProps {
  tvSymbol: string;
  category?: MarketCategoryId;
}

export function TradingViewChart({ tvSymbol, category }: TradingViewChartProps) {
  const containerId = `tv_${tvSymbol.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const mounted = useRef(true);

  // Validate before touching the DOM — prevents the AAPL default-fallback bug.
  // tvSymbol is read verbatim from instrument.tradingViewSymbol; never derived.
  const isValid = validateTradingViewSymbol(tvSymbol, category);

  useEffect(() => {
    if (!isValid) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[TradingView] Symbol "${tvSymbol}" (category: ${category}) is not in the validated set. Rendering fallback — widget never mounted.`);
      }
      return;
    }

    mounted.current = true;

    loadTVScript().then(() => {
      if (!mounted.current || !window.TradingView) return;
      // Clear any prior widget (handles React strict-mode double-mount).
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = "";
      try {
        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",           // candlestick
          locale: "en",
          toolbar_bg: "#13141f",
          enable_publishing: false,
          allow_symbol_change: false,
          hide_side_toolbar: false,
          save_image: false,
          container_id: containerId,
        });
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error(`[TradingView] Widget initialization failed for "${tvSymbol}":`, err);
        }
      }
    });

    return () => { mounted.current = false; };
  }, [tvSymbol, category, containerId, isValid]);

  if (!isValid) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1">
        <p className="text-sm font-medium text-text-secondary">Advanced TradingView chart unavailable for this asset.</p>
        <p className="text-xs text-text-secondary/50">Quote data remains available from the provider above.</p>
      </div>
    );
  }

  return <div id={containerId} className="h-full w-full" />;
}
