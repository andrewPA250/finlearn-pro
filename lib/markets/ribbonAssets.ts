/**
 * Step 15 — Market Ribbon v1
 * Curated list of 15 key assets to display in the global market ribbon.
 *
 * Future expansion paths (15.1+):
 * - expand to 30-50 assets
 * - add category tabs/filters
 * - user customization
 * - continuous auto-scroll
 */

export const DEFAULT_RIBBON_SYMBOLS = [
  "SPX",     // S&P 500
  "NDX",     // Nasdaq 100
  "DJI",     // Dow Jones
  "VIX",     // Volatility Index
  "AAPL",    // Apple
  "NVDA",    // NVIDIA
  "MSFT",    // Microsoft
  "TSLA",    // Tesla
  "BTCUSD",  // Bitcoin
  "ETHUSD",  // Ethereum
  "XAUUSD",  // Gold
  "WTI",     // Oil
  "EURUSD",  // EUR/USD
  "US10Y",   // Treasury 10Y
  "QQQ",     // Nasdaq 100 ETF
] as const;

export type RibbonSymbol = (typeof DEFAULT_RIBBON_SYMBOLS)[number];

/**
 * Get display priority for ribbon items.
 * Higher priority items appear first.
 */
export function getRibbonItemPriority(symbol: RibbonSymbol): number {
  const priorities: Record<RibbonSymbol, number> = {
    SPX: 100,
    NDX: 95,
    DJI: 90,
    VIX: 85,
    AAPL: 80,
    NVDA: 75,
    MSFT: 70,
    TSLA: 65,
    BTCUSD: 60,
    ETHUSD: 55,
    XAUUSD: 50,
    WTI: 45,
    EURUSD: 40,
    US10Y: 35,
    QQQ: 30,
  };
  return priorities[symbol];
}

// Future: expandRibbonAssets() will be added in Step 15.1+ to support dynamic expansion
