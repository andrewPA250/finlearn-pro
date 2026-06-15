import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { MarketDataPoint } from "@/types/market";
import { ASSET_FILE_NAMES } from "@/lib/market";
import { buildTickerQuote } from "@/lib/market/ticker";
import { MARKET_CATEGORIES, getInstrumentBySymbol } from "@/lib/markets/catalog";
import { AssetView } from "@/components/asset/AssetView";

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

/**
 * Asset page (Step 10.5, struttura estesa in Step 10.7): route definitiva
 * `/asset/[symbol]` per ogni strumento del catalogo Markets
 * (`MARKET_INSTRUMENTS`, fonte unica condivisa con `/markets` e la Search).
 * Per gli strumenti `"live"` mostra la quotazione reale già usata da
 * Home/Markets; per gli strumenti `"soon"` mostra una pagina placeholder
 * elegante con le stesse sezioni. Grafico/dati storici completi arriveranno
 * con il catalogo asset: questa pagina resta lo shell stabile in cui
 * inserirli (vedi `components/asset/`).
 */
export default function AssetPage({ params }: { params: { symbol: string } }) {
  const instrument = getInstrumentBySymbol(params.symbol);
  if (!instrument) notFound();

  const categoryLabel = MARKET_CATEGORIES.find((c) => c.id === instrument.category)?.label ?? instrument.category;

  const quote = instrument.assetId
    ? buildTickerQuote(instrument.assetId, readMarketData(ASSET_FILE_NAMES[instrument.assetId]))
    : null;

  return <AssetView instrument={instrument} categoryLabel={categoryLabel} quote={quote} />;
}
