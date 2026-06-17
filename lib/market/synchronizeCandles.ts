import type { MarketDataPoint } from "@/types/market";

interface QuoteLike {
  value: number;
  date: string;
}

/**
 * Synchronize chart data: append latest quote to historical candles.
 *
 * Problem: Candles cache for 24h (EOD closes), while quotes cache for 60s (intraday/current).
 * This creates a 1+ day gap between hero price and chart latest point.
 *
 * Solution: Append one synthetic point using the latest quote value and date.
 * If the quote date matches the last candle date, replace the last candle.
 * Otherwise, append a new point.
 *
 * This ensures the chart's rightmost value matches the hero price.
 *
 * @param candles Historical daily closes from provider
 * @param quote Latest quote (intraday or current) - any object with { value, date }
 * @returns Enhanced candles with latest quote appended/updated
 */
export function synchronizeCandles(
  candles: MarketDataPoint[],
  quote: QuoteLike | null
): MarketDataPoint[] {
  // No quote available, return candles as-is
  if (!quote) return candles;

  // Empty candles, can't synchronize
  if (candles.length === 0) return candles;

  const lastCandle = candles[candles.length - 1];
  const quoteDate = quote.date; // YYYY-MM-DD
  const lastCandleDate = lastCandle.date;

  // Quote is from the same date as last candle → replace the last point
  // This handles cases where the last candle is partial/EOD and quote is intraday/updated
  if (quoteDate === lastCandleDate) {
    return [
      ...candles.slice(0, -1),
      {
        date: quoteDate,
        value: quote.value,
      },
    ];
  }

  // Quote is from a newer date → append as new point
  // This handles end-of-day or next-day scenarios
  if (quoteDate > lastCandleDate) {
    return [
      ...candles,
      {
        date: quoteDate,
        value: quote.value,
      },
    ];
  }

  // Quote date is older than last candle (shouldn't happen in practice)
  // Return candles unchanged
  return candles;
}
