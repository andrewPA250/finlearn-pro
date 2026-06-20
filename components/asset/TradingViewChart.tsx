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
// - index / bond / commodity: DISABLED. Every catalog entry in these
//   categories uses TradingView's own calculated feeds — TVC:* for indices
//   (TVC:SPX, TVC:NDX), treasury yields (TVC:US10Y) and spot commodities
//   (TVC:GOLD, TVC:USOIL), plus continuous futures ("...1!", e.g. COMEX:HG1!)
//   for the rest. In the *anonymous* embed widget these all require a
//   logged-in TradingView session / carry data-licensing restrictions, which
//   produces the "This symbol is only available on TradingView" popup and a
//   silent fallback to the widget's default symbol (AAPL). This was confirmed
//   visually against the live widget (TVC:SPX), so the Advanced toggle is not
//   offered for these categories at all — the clean internal Recharts chart is
//   the only chart shown.
// - forex (FX:XXXXXX) / crypto (BINANCE:XXXUSDT): deterministic, standard
//   TradingView data feeds, always public in the free widget. Trusted by
//   prefix.
// - equity / etf: real exchange-listed tickers (NASDAQ:/NYSE:/AMEX:) are the
//   embed widget's primary use case and render publicly. Exchange-prefix
//   correctness varies per ticker and cannot be inferred from the symbol
//   string alone, so these are validated against an explicit, manually-curated
//   list. Anything not listed shows the clean "chart unavailable" fallback
//   rather than risking an unverified guess.
// ---------------------------------------------------------------------------

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

  switch (category) {
    case "index":
    case "bond":
    case "commodity":
      // TradingView's TVC:* / continuous-futures feeds are not embeddable in
      // the anonymous widget (confirmed against the live SPX chart). No
      // Advanced toggle for these — the internal Recharts chart is shown.
      return false;
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
