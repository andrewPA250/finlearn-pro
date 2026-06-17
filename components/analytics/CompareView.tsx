"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MARKET_INSTRUMENTS } from "@/lib/markets/catalog";
import { normalizeBase100, sanitizeSeries } from "@/lib/market";
import type { CompareAsset } from "@/app/analytics/compare/page";
import type { MarketDataPoint } from "@/types/market";

// ─── Constants ───────────────────────────────────────────────────────────────

type Period = "1M" | "3M" | "6M" | "1Y" | "MAX";
const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "MAX"];

const ASSET_COLORS = ["#00d4b8", "#6C63FF", "#fbbf24", "#f87171", "#4ade80"];

// ─── Formatting helpers ───────────────────────────────────────────────────────

function fmtPrice(v: number | undefined): string {
  if (v == null || isNaN(v)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: v >= 100 ? 2 : 4,
  }).format(v);
}

function fmtPct(v: number | undefined, showSign = true): string {
  if (v == null || isNaN(v)) return "—";
  const sign = showSign && v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function fmtLarge(v: number | undefined): string {
  if (!v || isNaN(v)) return "—";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toFixed(0)}`;
}

function fmtVolume(v: number | undefined): string {
  if (!v || isNaN(v)) return "—";
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(0);
}

function fmtNum(v: number | undefined, decimals = 2): string {
  if (v == null || isNaN(v)) return "—";
  return v.toFixed(decimals);
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

function filterByPeriod(candles: MarketDataPoint[], period: Period): MarketDataPoint[] {
  if (period === "MAX" || candles.length === 0) return candles;
  const days: Record<Exclude<Period, "MAX">, number> = {
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
  };
  const lastTs = new Date(candles[candles.length - 1].date).getTime();
  const cutoff = lastTs - days[period] * 86400000;
  return candles.filter((p) => new Date(p.date).getTime() >= cutoff);
}

function calcAnnualizedVol(candles: MarketDataPoint[]): number | null {
  if (candles.length < 10) return null;
  const rets: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1].value;
    if (prev === 0) continue;
    rets.push((candles[i].value - prev) / prev);
  }
  if (rets.length < 5) return null;
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length;
  return Math.sqrt(variance * 252) * 100;
}

function calcMaxDrawdown(candles: MarketDataPoint[]): number | null {
  if (candles.length < 2) return null;
  let peak = candles[0].value;
  let maxDD = 0;
  for (const p of candles) {
    if (p.value > peak) peak = p.value;
    const dd = peak > 0 ? (peak - p.value) / peak : 0;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD * 100;
}

function calcSharpe(candles: MarketDataPoint[]): number | null {
  if (candles.length < 20) return null;
  const rets: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1].value;
    if (prev === 0) continue;
    rets.push((candles[i].value - prev) / prev);
  }
  if (rets.length < 10) return null;
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return null;
  return (mean * 252) / (stdDev * Math.sqrt(252));
}

function calcPerformance(candles: MarketDataPoint[]): number | null {
  if (candles.length < 2) return null;
  const first = candles[0].value;
  const last = candles[candles.length - 1].value;
  if (first === 0) return null;
  return ((last - first) / first) * 100;
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function CompareTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-card border border-bg-border bg-bg-card p-3 shadow-lg">
      <p className="mb-2 text-xs text-text-muted">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-text-secondary">{entry.dataKey}</span>
          <span className="ml-auto font-mono text-text-primary">
            {entry.value != null ? entry.value.toFixed(1) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CompareView({ assets }: { assets: CompareAsset[] }) {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("1Y");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // ── Sanitize + filter candles per period ─────────────────────────────────
  const filteredCandles = useMemo(
    () =>
      assets.map((a) =>
        filterByPeriod(sanitizeSeries(a.candles), period)
      ),
    [assets, period]
  );

  // ── Normalized candles (base 100) per chart ───────────────────────────────
  const normalizedCandles = useMemo(
    () => filteredCandles.map((c) => normalizeBase100(c)),
    [filteredCandles]
  );

  // ── Merged chart data ─────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (normalizedCandles.every((c) => c.length === 0)) return [];
    const dateSet = new Set<string>();
    normalizedCandles.forEach((candles) =>
      candles.forEach((p) => dateSet.add(p.date))
    );
    const dates = Array.from(dateSet).sort();
    return dates.map((date) => {
      const point: Record<string, string | number> = { date };
      normalizedCandles.forEach((candles, idx) => {
        const sym = assets[idx].instrument.symbol;
        const found = candles.find((p) => p.date === date);
        if (found !== undefined) point[sym] = parseFloat(found.value.toFixed(2));
      });
      return point;
    });
  }, [normalizedCandles, assets]);

  // ── Risk metrics ──────────────────────────────────────────────────────────
  const riskMetrics = useMemo(
    () =>
      filteredCandles.map((candles) => ({
        vol: calcAnnualizedVol(candles),
        drawdown: calcMaxDrawdown(candles),
        sharpe: calcSharpe(candles),
        perf: calcPerformance(candles),
      })),
    [filteredCandles]
  );

  // ── Quick insights ────────────────────────────────────────────────────────
  const insights = useMemo(() => {
    const result: string[] = [];
    if (assets.length < 2) return result;

    // Best performance
    const perfValues = riskMetrics.map((r, i) => ({ i, v: r.perf }));
    const validPerf = perfValues.filter((x) => x.v != null) as { i: number; v: number }[];
    if (validPerf.length > 0) {
      const best = validPerf.reduce((a, b) => (a.v > b.v ? a : b));
      const worst = validPerf.reduce((a, b) => (a.v < b.v ? a : b));
      result.push(
        `${assets[best.i].instrument.symbol} had the best performance in this period (${fmtPct(best.v)}).`
      );
      if (best.i !== worst.i) {
        result.push(
          `${assets[worst.i].instrument.symbol} had the lowest return (${fmtPct(worst.v)}).`
        );
      }
    }

    // Highest market cap
    const caps = assets.map((a, i) => ({
      i,
      v: a.fundamentals?.marketCap ?? a.quote?.stats?.marketCap,
    }));
    const validCaps = caps.filter((x) => x.v != null) as { i: number; v: number }[];
    if (validCaps.length > 0) {
      const topCap = validCaps.reduce((a, b) => (a.v > b.v ? a : b));
      result.push(
        `${assets[topCap.i].instrument.symbol} has the largest market cap (${fmtLarge(topCap.v)}).`
      );
    }

    // Highest volatility
    const vols = riskMetrics.map((r, i) => ({ i, v: r.vol }));
    const validVols = vols.filter((x) => x.v != null) as { i: number; v: number }[];
    if (validVols.length > 0) {
      const mostVol = validVols.reduce((a, b) => (a.v > b.v ? a : b));
      result.push(
        `${assets[mostVol.i].instrument.symbol} is the most volatile (${fmtNum(mostVol.v)}% ann. vol).`
      );
    }

    // Lowest drawdown
    const dds = riskMetrics.map((r, i) => ({ i, v: r.drawdown }));
    const validDDs = dds.filter((x) => x.v != null) as { i: number; v: number }[];
    if (validDDs.length > 0) {
      const lowestDD = validDDs.reduce((a, b) => (a.v < b.v ? a : b));
      result.push(
        `${assets[lowestDD.i].instrument.symbol} had the shallowest drawdown (${fmtNum(lowestDD.v)}%).`
      );
    }

    return result;
  }, [assets, riskMetrics]);

  // ── Asset management ──────────────────────────────────────────────────────
  function removeAsset(symbol: string) {
    const remaining = assets
      .map((a) => a.instrument.symbol)
      .filter((s) => s !== symbol);
    if (remaining.length === 0) return;
    router.push(`/analytics/compare?symbols=${remaining.join(",")}`);
  }

  function addAsset(symbol: string) {
    const current = assets.map((a) => a.instrument.symbol);
    if (current.includes(symbol) || current.length >= 5) return;
    router.push(`/analytics/compare?symbols=${[...current, symbol].join(",")}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  // ── Asset search results ──────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    const existing = new Set(assets.map((a) => a.instrument.symbol));
    return MARKET_INSTRUMENTS.filter(
      (inst) =>
        !existing.has(inst.symbol) &&
        (inst.symbol.toLowerCase().includes(q) ||
          inst.name.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [searchQuery, assets]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-primary pb-12">
      {/* ── Header ── */}
      <div className="border-b border-bg-border bg-bg-sidebar px-4 py-5 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-card bg-cyan-bg/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan">
              Analytics
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Asset Compare</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Compare performance, fundamentals, and risk side-by-side.
          </p>

          {/* Asset chips + add */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {assets.map((a, idx) => (
              <div
                key={a.instrument.symbol}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold"
                style={{
                  borderColor: ASSET_COLORS[idx] + "60",
                  backgroundColor: ASSET_COLORS[idx] + "18",
                  color: ASSET_COLORS[idx],
                }}
              >
                <span>{a.instrument.symbol}</span>
                {assets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAsset(a.instrument.symbol)}
                    className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full opacity-60 hover:opacity-100 transition"
                    aria-label={`Remove ${a.instrument.symbol}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {assets.length < 5 && (
              <div ref={searchRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSearchOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-full border border-dashed border-bg-border px-3 py-1 text-sm text-text-secondary transition hover:border-cyan/40 hover:text-cyan"
                >
                  <span>＋</span>
                  <span>Add asset</span>
                </button>

                {searchOpen && (
                  <div className="absolute left-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-card border border-bg-border bg-bg-card shadow-xl">
                    <div className="border-b border-bg-border px-3 py-2">
                      <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search symbol or name…"
                        className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto p-1">
                      {searchResults.length === 0 ? (
                        <p className="px-3 py-4 text-center text-xs text-text-muted">
                          {searchQuery ? "No results found" : "Type to search assets"}
                        </p>
                      ) : (
                        searchResults.map((inst) => (
                          <button
                            key={inst.symbol}
                            type="button"
                            onClick={() => addAsset(inst.symbol)}
                            className="flex w-full items-center justify-between rounded-card px-3 py-2 text-left text-sm transition hover:bg-bg-hover"
                          >
                            <span>
                              <span className="font-semibold text-text-primary">
                                {inst.symbol}
                              </span>
                              <span className="ml-2 text-xs text-text-muted truncate">
                                {inst.name}
                              </span>
                            </span>
                            <span className="ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] text-text-muted bg-bg-hover">
                              {inst.category}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
        {/* ── Period selector ── */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Period:</span>
          <div className="flex rounded-card border border-bg-border bg-bg-card p-0.5 gap-0.5">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded px-3 py-1 text-xs font-medium transition ${
                  period === p
                    ? "bg-cyan text-bg-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ── Section 2: Performance Chart ── */}
        <section className="rounded-card border border-bg-border bg-bg-card p-4 md:p-6">
          <h2 className="mb-1 text-base font-semibold text-text-primary">
            Performance Comparison
          </h2>
          <p className="mb-4 text-xs text-text-muted">
            Normalized to base 100 — all assets start equal for fair comparison.
          </p>

          {chartData.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-text-muted">No chart data available for this period.</p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-hover)" />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-muted)"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    minTickGap={60}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    domain={["auto", "auto"]}
                    tickFormatter={(v) => `${v.toFixed(0)}`}
                  />
                  <Tooltip content={<CompareTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }}
                  />
                  {assets.map((a, idx) => (
                    <Line
                      key={a.instrument.symbol}
                      dataKey={a.instrument.symbol}
                      name={a.instrument.symbol}
                      stroke={ASSET_COLORS[idx]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Period return summary */}
          <div className="mt-4 flex flex-wrap gap-3">
            {assets.map((a, idx) => {
              const perf = riskMetrics[idx].perf;
              return (
                <div
                  key={a.instrument.symbol}
                  className="flex items-center gap-2 rounded-card border border-bg-border bg-bg-primary px-3 py-1.5"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: ASSET_COLORS[idx] }}
                  />
                  <span className="text-xs text-text-secondary">
                    {a.instrument.symbol}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      perf == null
                        ? "text-text-muted"
                        : perf >= 0
                        ? "text-positive"
                        : "text-negative"
                    }`}
                  >
                    {perf != null ? fmtPct(perf) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Section 3: Metrics Table ── */}
        <section className="rounded-card border border-bg-border bg-bg-card overflow-hidden">
          <div className="border-b border-bg-border px-4 py-3 md:px-6">
            <h2 className="text-base font-semibold text-text-primary">Metrics Comparison</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-bg-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted md:px-6">
                    Metric
                  </th>
                  {assets.map((a, idx) => (
                    <th
                      key={a.instrument.symbol}
                      className="px-3 py-3 text-right text-xs font-semibold"
                      style={{ color: ASSET_COLORS[idx] }}
                    >
                      {a.instrument.symbol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {/* Price */}
                <tr className="hover:bg-bg-hover/30">
                  <td className="px-4 py-3 text-xs text-text-secondary md:px-6">Price</td>
                  {assets.map((a) => (
                    <td key={a.instrument.symbol} className="px-3 py-3 text-right text-xs font-mono text-text-primary">
                      {fmtPrice(a.quote?.value)}
                    </td>
                  ))}
                </tr>
                {/* Daily Change */}
                <tr className="hover:bg-bg-hover/30">
                  <td className="px-4 py-3 text-xs text-text-secondary md:px-6">Daily Change</td>
                  {assets.map((a) => {
                    const cp = a.quote?.changePercent;
                    return (
                      <td
                        key={a.instrument.symbol}
                        className={`px-3 py-3 text-right text-xs font-mono ${
                          cp == null
                            ? "text-text-muted"
                            : cp >= 0
                            ? "text-positive"
                            : "text-negative"
                        }`}
                      >
                        {cp != null ? fmtPct(cp) : "—"}
                      </td>
                    );
                  })}
                </tr>
                {/* Market Cap */}
                <tr className="hover:bg-bg-hover/30">
                  <td className="px-4 py-3 text-xs text-text-secondary md:px-6">Market Cap</td>
                  {assets.map((a) => {
                    const cap = a.fundamentals?.marketCap ?? a.quote?.stats?.marketCap;
                    return (
                      <td key={a.instrument.symbol} className="px-3 py-3 text-right text-xs font-mono text-text-primary">
                        {fmtLarge(cap)}
                      </td>
                    );
                  })}
                </tr>
                {/* P/E */}
                <tr className="hover:bg-bg-hover/30">
                  <td className="px-4 py-3 text-xs text-text-secondary md:px-6">P/E Ratio</td>
                  {assets.map((a) => {
                    const pe = a.fundamentals?.trailingPE ?? a.quote?.stats?.pe;
                    return (
                      <td key={a.instrument.symbol} className="px-3 py-3 text-right text-xs font-mono text-text-primary">
                        {fmtNum(pe)}
                      </td>
                    );
                  })}
                </tr>
                {/* EPS */}
                <tr className="hover:bg-bg-hover/30">
                  <td className="px-4 py-3 text-xs text-text-secondary md:px-6">EPS</td>
                  {assets.map((a) => {
                    const eps = a.fundamentals?.eps ?? a.quote?.stats?.eps;
                    return (
                      <td key={a.instrument.symbol} className="px-3 py-3 text-right text-xs font-mono text-text-primary">
                        {eps != null ? fmtPrice(eps) : "—"}
                      </td>
                    );
                  })}
                </tr>
                {/* Volume */}
                <tr className="hover:bg-bg-hover/30">
                  <td className="px-4 py-3 text-xs text-text-secondary md:px-6">Volume</td>
                  {assets.map((a) => {
                    const vol = a.quote?.stats?.volume;
                    return (
                      <td key={a.instrument.symbol} className="px-3 py-3 text-right text-xs font-mono text-text-primary">
                        {fmtVolume(vol)}
                      </td>
                    );
                  })}
                </tr>
                {/* 52W Position */}
                <tr className="hover:bg-bg-hover/30">
                  <td className="px-4 py-3 text-xs text-text-secondary md:px-6">52W Position</td>
                  {assets.map((a) => {
                    const hi = a.fundamentals?.fiftyTwoWeekHigh ?? a.quote?.stats?.fiftyTwoWeekHigh;
                    const lo = a.fundamentals?.fiftyTwoWeekLow ?? a.quote?.stats?.fiftyTwoWeekLow;
                    const price = a.quote?.value;
                    if (!hi || !lo || !price || hi === lo) {
                      return (
                        <td key={a.instrument.symbol} className="px-3 py-3 text-right text-xs text-text-muted">
                          —
                        </td>
                      );
                    }
                    const pos = Math.round(((price - lo) / (hi - lo)) * 100);
                    return (
                      <td key={a.instrument.symbol} className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-bg-hover">
                            <div
                              className="h-full rounded-full bg-cyan"
                              style={{ width: `${pos}%` }}
                            />
                          </div>
                          <span className="w-7 text-right text-xs font-mono text-text-primary">
                            {pos}%
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section 4: Risk Snapshot ── */}
        <section className="rounded-card border border-bg-border bg-bg-card p-4 md:p-6">
          <h2 className="mb-1 text-base font-semibold text-text-primary">Risk Snapshot</h2>
          <p className="mb-4 text-xs text-text-muted">
            Calculated from price history for the selected period.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Volatility */}
            <div className="rounded-card border border-bg-border bg-bg-primary p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Ann. Volatility
              </div>
              <div className="space-y-2">
                {assets.map((a, idx) => (
                  <div key={a.instrument.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: ASSET_COLORS[idx] }}
                      />
                      <span className="text-xs text-text-secondary">{a.instrument.symbol}</span>
                    </div>
                    <span className="text-xs font-mono text-text-primary">
                      {riskMetrics[idx].vol != null
                        ? `${fmtNum(riskMetrics[idx].vol)}%`
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Max Drawdown */}
            <div className="rounded-card border border-bg-border bg-bg-primary p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Max Drawdown
              </div>
              <div className="space-y-2">
                {assets.map((a, idx) => (
                  <div key={a.instrument.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: ASSET_COLORS[idx] }}
                      />
                      <span className="text-xs text-text-secondary">{a.instrument.symbol}</span>
                    </div>
                    <span className="text-xs font-mono text-negative">
                      {riskMetrics[idx].drawdown != null
                        ? `-${fmtNum(riskMetrics[idx].drawdown)}%`
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sharpe Ratio */}
            <div className="rounded-card border border-bg-border bg-bg-primary p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Sharpe Ratio
              </div>
              <div className="space-y-2">
                {assets.map((a, idx) => (
                  <div key={a.instrument.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: ASSET_COLORS[idx] }}
                      />
                      <span className="text-xs text-text-secondary">{a.instrument.symbol}</span>
                    </div>
                    <span className="text-xs font-mono text-text-primary">
                      {riskMetrics[idx].sharpe != null
                        ? fmtNum(riskMetrics[idx].sharpe)
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Beta placeholder */}
          <div className="mt-3 rounded-card border border-bg-border bg-bg-hover/30 px-4 py-3">
            <span className="text-xs text-text-muted">
              Beta vs S&P 500 — <span className="font-medium text-text-secondary">Coming Soon</span>
            </span>
          </div>
        </section>

        {/* ── Section 5: Quick Insights ── */}
        {insights.length > 0 && (
          <section className="rounded-card border border-bg-border bg-bg-card p-4 md:p-6">
            <h2 className="mb-4 text-base font-semibold text-text-primary">Quick Insights</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-card border border-bg-border bg-bg-primary px-4 py-3"
                >
                  <span className="mt-0.5 text-cyan">▸</span>
                  <p className="text-sm text-text-secondary">{insight}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-text-disabled">
          Data from Yahoo Finance · Calculations based on daily close prices · Not financial advice
        </p>
      </div>
    </div>
  );
}
