"use client";

import { useEffect, useRef } from "react";

// TradingView widget global — set by tv.js after load
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { TradingView: any }
}

// ---------------------------------------------------------------------------
// Validated symbol whitelist
// These are the only symbols we guarantee work in the TradingView free widget.
// An unlisted symbol would cause TradingView to silently fall back to AAPL,
// which is unacceptable. Any new symbol must be manually verified and added here.
// ---------------------------------------------------------------------------
const VALIDATED_TV_SYMBOLS = new Set([
  // Indices — TVC is TradingView's own data feed, always accessible
  "TVC:SPX", "TVC:NDX", "TVC:DJI", "TVC:RUT",
  // US Equities
  "NASDAQ:AAPL", "NASDAQ:MSFT", "NASDAQ:NVDA", "NASDAQ:AMZN",
  "NASDAQ:GOOGL", "NASDAQ:META", "NASDAQ:TSLA", "NASDAQ:AMD",
  "NASDAQ:PLTR", "NASDAQ:QQQ",
  // ETFs
  "AMEX:SPY", "AMEX:VOO", "AMEX:VTI", "AMEX:SCHD", "AMEX:AGG", "AMEX:BND",
  // Crypto (Binance USDT pairs — highest liquidity, public in free widget)
  "BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:XRPUSDT", "BINANCE:ADAUSDT",
  // Forex
  "FX:EURUSD", "FX:GBPUSD", "FX:USDJPY",
  // Commodities
  "TVC:GOLD", "TVC:SILVER", "TVC:USOIL", "TVC:NATURALGAS",
  // Bonds / Rates
  "TVC:US10Y", "TVC:US2Y", "TVC:US30Y",
]);

export function validateTradingViewSymbol(symbol: string): boolean {
  return VALIDATED_TV_SYMBOLS.has(symbol);
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
}

export function TradingViewChart({ tvSymbol }: TradingViewChartProps) {
  const containerId = `tv_${tvSymbol.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const mounted = useRef(true);

  // Validate before touching the DOM — prevents the AAPL default-fallback bug.
  const isValid = validateTradingViewSymbol(tvSymbol);

  useEffect(() => {
    if (!isValid) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[TradingView] Symbol "${tvSymbol}" is not in the validated set. Rendering fallback.`);
      }
      return;
    }

    mounted.current = true;

    loadTVScript().then(() => {
      if (!mounted.current || !window.TradingView) return;
      // Clear any prior widget (handles React strict-mode double-mount).
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = "";
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
    });

    return () => { mounted.current = false; };
  }, [tvSymbol, containerId, isValid]);

  if (!isValid) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1">
        <p className="text-sm font-medium text-text-secondary">Chart unavailable for this asset.</p>
        <p className="text-xs text-text-secondary/50">Quote data remains available from the provider above.</p>
      </div>
    );
  }

  return <div id={containerId} className="h-full w-full" />;
}
