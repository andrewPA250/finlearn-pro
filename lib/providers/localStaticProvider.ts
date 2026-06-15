import fs from "fs";
import path from "path";
import type { AssetId, MarketDataPoint } from "@/types/market";
import { ASSET_FILE_NAMES, ASSET_LABELS, ASSET_UNITS, sanitizeSeries } from "@/lib/market";
import type { MarketDataProvider, ProviderCandles, ProviderQuote } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

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
 * Provider locale "static EOD" (Step 12): legge le serie storiche già
 * presenti in `public/data/*.json` (`sp500`, `gold`, `us10y` — gli stessi
 * file usati da Home/Markets/Workbench/Asset page da Step 1).
 *
 * - `source`: `"local-static"`
 * - `freshness`: sempre `"eod"` (fine giornata) — coerente con l'origine
 *   dei dati (FRED/Stooq, vedi `ASSET_SOURCE_LABELS` in `lib/market.ts`)
 * - `getCandles`/`getQuote` ritornano `null` se il file non esiste o non
 *   contiene almeno 2 punti validi: **nessun dato finto**, mai un valore
 *   inventato per coprire un asset privo di serie reale.
 *
 * Server-only: usa `fs`/`path`, va importato solo da Server Components
 * (`app/**\/page.tsx`) o da altri moduli server-only come
 * `lib/providers/index.ts` — mai da componenti `"use client"`.
 */
class LocalStaticMarketDataProvider implements MarketDataProvider {
  readonly source = "local-static" as const;

  getCandles(assetId: AssetId): ProviderCandles | null {
    const points = sanitizeSeries(readJsonFile(ASSET_FILE_NAMES[assetId]));
    if (points.length === 0) return null;
    return { assetId, points, freshness: "eod", source: this.source };
  }

  getQuote(assetId: AssetId): ProviderQuote | null {
    const candles = this.getCandles(assetId);
    if (!candles || candles.points.length < 2) return null;

    const last = candles.points[candles.points.length - 1];
    const prev = candles.points[candles.points.length - 2];
    const change = last.value - prev.value;
    const changePercent = prev.value !== 0 ? (change / prev.value) * 100 : 0;

    return {
      assetId,
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
