import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { MarketDataPoint } from "@/types/market";
import { ASSET_FILE_NAMES } from "@/lib/market";
import { buildTickerQuote, formatQuoteChange, formatQuoteValue } from "@/lib/market/ticker";
import { MARKET_CATEGORIES, getInstrumentBySymbol } from "@/lib/markets/catalog";

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
 * Asset page (Step 10.5): architettura/route definitiva `/asset/[symbol]`
 * per ogni strumento del catalogo Markets (es. `/asset/AAPL`,
 * `/asset/BTCUSD`). Per gli strumenti `"live"` mostra la quotazione reale
 * già usata da Home/Markets; per gli strumenti `"soon"` mostra un
 * placeholder. Grafico/dati storici completi arriveranno con il catalogo
 * asset: questa pagina resta lo shell stabile in cui inserirli.
 */
export default function AssetPage({ params }: { params: { symbol: string } }) {
  const instrument = getInstrumentBySymbol(params.symbol);
  if (!instrument) notFound();

  const categoryLabel = MARKET_CATEGORIES.find((c) => c.id === instrument.category)?.label ?? instrument.category;

  const quote = instrument.assetId
    ? buildTickerQuote(instrument.assetId, readMarketData(ASSET_FILE_NAMES[instrument.assetId]))
    : null;

  return (
    <div className="mx-auto max-w-platform p-6">
      <Link
        href="/markets"
        className="text-xs font-bold text-text-secondary transition duration-150 ease-in-out hover:text-text-primary"
      >
        ← Markets
      </Link>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-accent-purple">{categoryLabel}</p>
      <h1 className="mt-1 text-2xl font-bold text-text-primary">
        {instrument.name} <span className="font-mono text-text-secondary">· {instrument.symbol}</span>
      </h1>

      {quote ? (
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-2xl font-bold text-text-primary">{formatQuoteValue(quote)}</span>
          <span
            className={`font-mono text-sm font-bold ${quote.change >= 0 ? "text-accent-green" : "text-error"}`}
          >
            {formatQuoteChange(quote)}
          </span>
          <span className="text-xs text-text-secondary">aggiornato al {quote.date}</span>
        </div>
      ) : (
        <p className="mt-4 max-w-reading text-sm text-text-secondary">
          Dati e grafico per {instrument.symbol} arriveranno con il catalogo asset completo. Questa pagina
          rappresenta già la struttura definitiva usata da Markets, Watchlist e Portfolio per ogni strumento.
        </p>
      )}
    </div>
  );
}
