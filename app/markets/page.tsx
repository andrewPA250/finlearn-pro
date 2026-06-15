import fs from "fs";
import path from "path";
import type { AssetId, MarketDataPoint } from "@/types/market";
import { ASSET_FILE_NAMES } from "@/lib/market";
import { buildTickerQuotes } from "@/lib/market/ticker";
import { MarketsView } from "@/components/markets/MarketsView";

const DATA_DIR = path.join(process.cwd(), "public", "data");

function readMarketData(fileName: string): MarketDataPoint[] {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, fileName), "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MarketDataPoint[]) : [];
  } catch {
    return [];
  }
}

export default function MarketsPage() {
  const rawData: Record<AssetId, MarketDataPoint[]> = {
    sp500: readMarketData(ASSET_FILE_NAMES.sp500),
    gold: readMarketData(ASSET_FILE_NAMES.gold),
    us10y: readMarketData(ASSET_FILE_NAMES.us10y),
  };

  return <MarketsView tickerQuotes={buildTickerQuotes(rawData)} />;
}
