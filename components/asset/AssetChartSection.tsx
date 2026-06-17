"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MarketDataPoint } from "@/types/market";
import type { AssetUnit } from "@/lib/market";
import type { ProviderSource } from "@/lib/providers/types";
import type { TickerQuote } from "@/lib/market/ticker";
import { synchronizeCandles } from "@/lib/market/synchronizeCandles";
import { TradingViewChart, validateTradingViewSymbol } from "@/components/asset/TradingViewChart";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChartMode = "sync" | "advanced";
type ChartTimeframe = "1M" | "6M" | "1Y" | "MAX";

interface AssetChartSectionProps {
  symbol: string;
  candles: MarketDataPoint[] | null;
  quote: TickerQuote | null;
  unit: AssetUnit;
  source: ProviderSource;
  /** TradingView symbol — when present the Advanced mode toggle becomes available. */
  tvSymbol?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LS_KEY = "finlearn_chartMode";

const TIMEFRAMES: { label: string; value: ChartTimeframe; days: number | null }[] = [
  { label: "1M",  value: "1M",  days: 30 },
  { label: "6M",  value: "6M",  days: 180 },
  { label: "1Y",  value: "1Y",  days: 365 },
  { label: "MAX", value: "MAX", days: null },
];

const MONTHS_SHORT = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatXTick(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  return `${MONTHS_SHORT[parseInt(month, 10) - 1] ?? month} ${year.slice(2)}`;
}

function formatYAxis(value: number, unit: AssetUnit): string {
  if (unit === "percent") return `${value.toFixed(2)}%`;
  if (value >= 10000) return `${(value / 1000).toFixed(0)}k`;
  if (value >= 1000)  return `${(value / 1000).toFixed(1)}k`;
  if (value >= 100)   return value.toFixed(0);
  if (value >= 10)    return value.toFixed(2);
  return value.toFixed(4);
}

function formatTooltipValue(value: number, unit: AssetUnit): string {
  if (unit === "percent") return `${value.toFixed(2)}%`;
  if (value >= 10000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 1000)  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value >= 10)    return value.toFixed(2);
  return value.toFixed(4);
}

function getSourceLabel(source: ProviderSource): string {
  switch (source) {
    case "yahoo":          return "Yahoo Finance";
    case "finnhub":        return "Finnhub";
    case "coingecko":      return "CoinGecko";
    case "frankfurter-ecb":return "BCE / Frankfurter";
    case "local-static":   return "FRED / Stooq";
    default:               return source;
  }
}

function readStoredMode(): ChartMode {
  try {
    return localStorage.getItem(LS_KEY) === "advanced" ? "advanced" : "sync";
  } catch {
    return "sync";
  }
}

// ---------------------------------------------------------------------------
// Tooltip factory
// ---------------------------------------------------------------------------

function makeTooltip(unit: AssetUnit) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function ChartTooltip(props: any) {
    const { active, payload, label } = props as {
      active?: boolean;
      payload?: ReadonlyArray<{ value: number }>;
      label?: string;
    };
    if (!active || !payload?.length || !label) return null;
    const [y, m, d] = label.split("-");
    const monthLabel = MONTHS_SHORT[parseInt(m, 10) - 1] ?? m;
    return (
      <div className="rounded-md border border-bg-sidebar bg-bg-card px-3 py-2 text-xs shadow-lg">
        <p className="text-text-secondary">
          {parseInt(d, 10)} {monthLabel} {y}
        </p>
        <p className="mt-0.5 font-mono font-bold text-text-primary">
          {formatTooltipValue(payload[0].value, unit)}
        </p>
      </div>
    );
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AssetChartSection({ symbol, candles, quote, unit, source, tvSymbol }: AssetChartSectionProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>("1Y");
  const [mode, setMode]           = useState<ChartMode>("sync");
  const [hydrated, setHydrated]   = useState(false);

  const tvAvailable = !!tvSymbol && validateTradingViewSymbol(tvSymbol);

  // Hydration-safe localStorage read — avoids SSR/client mismatch.
  useEffect(() => {
    setHydrated(true);
    if (tvAvailable) setMode(readStoredMode());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMode = (m: ChartMode) => {
    setMode(m);
    try { localStorage.setItem(LS_KEY, m); } catch { /* storage unavailable */ }
  };

  // Only mount TradingView after hydration and when user explicitly chose it.
  const showTV = hydrated && tvAvailable && mode === "advanced";

  // ---------------------------------------------------------------------------
  // Recharts data
  // ---------------------------------------------------------------------------

  const filtered = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    // Synchronize chart: append latest quote to candles so chart latest point matches hero price
    let data = synchronizeCandles(candles, quote);
    const tf = TIMEFRAMES.find((t) => t.value === timeframe);
    if (tf?.days) {
      const cutoff = new Date(Date.now() - tf.days * 86_400_000).toISOString().slice(0, 10);
      data = data.filter((p) => p.date >= cutoff);
    }
    // Downsample to ≤600 points to keep SVG rendering fast.
    const MAX_POINTS = 600;
    if (data.length > MAX_POINTS) {
      const step = Math.ceil(data.length / MAX_POINTS);
      data = data.filter((_, i) => i % step === 0 || i === data.length - 1);
    }
    return data;
  }, [candles, quote, timeframe]);

  const hasData = filtered.length >= 2;

  const yAxisWidth = useMemo(() => {
    if (!filtered.length) return 48;
    const max = Math.max(...filtered.map((p) => p.value));
    if (max >= 10000) return 56;
    if (max >= 1000)  return 52;
    if (max >= 100)   return 44;
    return 52;
  }, [filtered]);

  const tooltip = useMemo(() => makeTooltip(unit), [unit]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section id="chart" className="rounded-card border border-bg-border bg-bg-card p-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">

        {/* Left: "Chart" label + mode toggle */}
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">
            Chart
          </h2>

          {tvAvailable && (
            <div className="flex items-center gap-px rounded-full border border-white/[0.07] p-0.5">
              <button
                onClick={() => switchMode("sync")}
                aria-pressed={mode === "sync" || !hydrated}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors duration-100 ${
                  !hydrated || mode === "sync"
                    ? "bg-cyan-bg text-cyan"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Synchronized
              </button>
              <button
                onClick={() => switchMode("advanced")}
                aria-pressed={hydrated && mode === "advanced"}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors duration-100 ${
                  hydrated && mode === "advanced"
                    ? "bg-cyan-bg text-cyan"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Advanced ↗
              </button>
            </div>
          )}
        </div>

        {/* Right: timeframe buttons (sync mode only) */}
        {!showTV && hasData && (
          <div className="flex items-center gap-0.5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`rounded px-2 py-0.5 text-[10px] font-bold transition-colors duration-100 ${
                  timeframe === tf.value
                    ? "bg-cyan-bg text-cyan"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Disclosure banner (Advanced mode only) ─────────────────────────── */}
      {showTV && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md border border-white/[0.05] bg-white/[0.025] px-3 py-2">
          <svg
            className="mt-0.5 h-3 w-3 shrink-0 text-text-secondary/60"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zM7 7h2v4H7V7z" />
          </svg>
          <p className="text-[10px] leading-relaxed text-text-secondary/70">
            Advanced chart powered by TradingView. Quote, statistics, and market metrics are provided by Yahoo Finance and may differ because of provider and data frequency differences.
          </p>
        </div>
      )}

      {/* ── Chart area ─────────────────────────────────────────────────────── */}
      {showTV ? (
        <div className="mt-3 h-[420px] sm:h-[500px]">
          <TradingViewChart key={tvSymbol} tvSymbol={tvSymbol!} />
        </div>
      ) : hasData ? (
        <div className="mt-3 h-[240px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filtered}
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXTick}
                stroke="#8B8FA8"
                tick={{ fontSize: 10, fill: "#8B8FA8" }}
                minTickGap={56}
              />
              <YAxis
                width={yAxisWidth}
                stroke="#8B8FA8"
                tick={{ fontSize: 10, fill: "#8B8FA8" }}
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => formatYAxis(v, unit)}
              />
              <Tooltip content={tooltip} />
              <Line
                dataKey="value"
                stroke="#00d4b8"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-3 text-sm text-text-secondary">
          Historical chart not available yet for {symbol}.
        </p>
      )}

      {/* ── Source attribution (sync mode only) ────────────────────────────── */}
      {!showTV && hasData && (
        <p className="mt-2 text-[10px] text-text-secondary/50">
          {getSourceLabel(source)} · Historical closes + latest quote · Synchronized for accuracy.
        </p>
      )}
    </section>
  );
}
