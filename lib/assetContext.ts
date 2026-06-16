import type { ProviderStats } from "@/lib/providers/types";
import type { MarketDataPoint } from "@/types/market";

export interface MarketContextData {
  fiftyTwoWeekLow: number | null;
  fiftyTwoWeekHigh: number | null;
  /** 0–100 position of current price within the 52W range */
  positionPct: number | null;
  /** 200-day SMA calculated from candles, or null if insufficient data */
  sma200: number | null;
  /** Whether current price is above or below the 200-day SMA */
  trendVs200: "above" | "below" | null;
  /** Pct distance from price to 200-day SMA */
  trendPctDelta: number | null;
}

/**
 * Derive market context from live stats + historical candles.
 * All calculations are pure — no side effects.
 */
export function computeMarketContext(
  currentPrice: number | null,
  stats: ProviderStats | undefined,
  candles: MarketDataPoint[],
): MarketContextData {
  const low52 = stats?.fiftyTwoWeekLow ?? null;
  const high52 = stats?.fiftyTwoWeekHigh ?? null;

  // --- 52W position ---
  let positionPct: number | null = null;
  if (currentPrice != null && low52 != null && high52 != null && high52 > low52) {
    positionPct = Math.round(((currentPrice - low52) / (high52 - low52)) * 100);
    positionPct = Math.min(100, Math.max(0, positionPct));
  }

  // --- 200-day SMA from candles ---
  let sma200: number | null = null;
  let trendVs200: "above" | "below" | null = null;
  let trendPctDelta: number | null = null;

  if (candles.length >= 200) {
    const last200 = candles.slice(-200);
    const sum = last200.reduce((acc, p) => acc + p.value, 0);
    sma200 = sum / 200;

    if (currentPrice != null && sma200 > 0) {
      trendVs200 = currentPrice >= sma200 ? "above" : "below";
      trendPctDelta = ((currentPrice - sma200) / sma200) * 100;
    }
  }

  return { fiftyTwoWeekLow: low52, fiftyTwoWeekHigh: high52, positionPct, sma200, trendVs200, trendPctDelta };
}
