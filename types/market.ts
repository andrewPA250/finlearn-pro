export type AssetId = "sp500" | "gold" | "us10y";

export type Timeframe = "1Y" | "5Y" | "10Y";

export type OverlayId = "stdDev" | "ma200";

export interface MarketDataPoint {
  date: string;
  value: number;
}
