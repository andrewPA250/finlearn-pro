import fs from "fs";
import path from "path";
import type { AssetId, MarketDataPoint } from "@/types/market";
import { ASSET_FILE_NAMES, ASSET_LABELS, ASSET_UNITS, sanitizeSeries } from "@/lib/market";
import type { MarketDataProvider, ProviderCandles, ProviderQuote } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

/** Mappa dal simbolo catalogo all'`AssetId` usato dai file locali. */
const SYMBOL_TO_ASSET_ID: Record<string, AssetId> = {
  SPX: "sp500",
  XAUUSD: "gold",
  US10Y: "us10y",
};

function readJsonFile(fileName: string): MarketDataPoint[] {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, fileName), "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MarketDataPoint[]) : [];
  } catch {
    return [];
  }
}

/**
 * Provider locale "static EOD" (Step 12): legge le serie storiche in
 * `public/data/*.json` per SPX, XAUUSD, US10Y.
 *
 * - `source`: `"local-static"`
 * - `freshness`: sempre `"eod"` (fine giornata)
 * - Accetta simboli catalogo ("SPX", "XAUUSD", "US10Y"); mappa internamente
 *   all'`AssetId` per leggere il file corretto.
 * - Ritorna `null` se il file non esiste o non contiene dati validi:
 *   **mai dati finti**.
 *
 * Server-only: usa `fs`/`path`.
 */
class LocalStaticMarketDataProvider implements MarketDataProvider {
  readonly source = "local-static" as const;

  async getCandles(symbol: string): Promise<ProviderCandles | null> {
    const assetId = SYMBOL_TO_ASSET_ID[symbol];
    if (!assetId) return null;
    const points = sanitizeSeries(readJsonFile(ASSET_FILE_NAMES[assetId]));
    if (points.length === 0) return null;
    return { symbol, points, freshness: "eod", source: this.source };
  }

  async getQuote(symbol: string): Promise<ProviderQuote | null> {
    const assetId = SYMBOL_TO_ASSET_ID[symbol];
    if (!assetId) return null;
    const candles = await this.getCandles(symbol);
    if (!candles || candles.points.length < 2) return null;

    const last = candles.points[candles.points.length - 1];
    const prev = candles.points[candles.points.length - 2];
    const change = last.value - prev.value;
    const changePercent = prev.value !== 0 ? (change / prev.value) * 100 : 0;

    return {
      symbol,
      label: ASSET_LABELS[assetId],
      unit: ASSET_UNITS[assetId],
      value: last.value,
      change,
      changePercent,
      date: last.date,
      freshness: "eod",
      source: this.source,
    };
  }
}

export const localStaticProvider: MarketDataProvider = new LocalStaticMarketDataProvider();
