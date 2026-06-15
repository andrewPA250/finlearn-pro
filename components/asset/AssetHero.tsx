import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteChange, formatQuoteValue } from "@/lib/market/ticker";
import { AssetStatusBadge } from "@/components/asset/AssetStatusBadge";

interface AssetHeroProps {
  instrument: MarketInstrument;
  categoryLabel: string;
  quote: TickerQuote | null;
}

/**
 * Header della pagina asset: breadcrumb verso Markets, categoria + stato,
 * nome/simbolo, e quotazione (se disponibile) o messaggio placeholder. Per
 * gli strumenti collegati a un dataset reale (`assetId`) mostra una CTA verso
 * Workbench, dove lo stesso dataset è già visualizzabile in dettaglio.
 */
export function AssetHero({ instrument, categoryLabel, quote }: AssetHeroProps) {
  return (
    <div className="animate-fade-in-up">
      <Link
        href="/markets"
        className="text-xs font-bold text-text-secondary transition duration-150 ease-in-out hover:text-text-primary"
      >
        ← Markets
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-purple">{categoryLabel}</p>
        <AssetStatusBadge status={instrument.status} />
      </div>

      <h1 className="mt-1 text-2xl font-bold text-text-primary">
        {instrument.name} <span className="font-mono text-text-secondary">· {instrument.symbol}</span>
      </h1>

      {quote ? (
        <div className="mt-3 flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-3xl font-bold text-text-primary">{formatQuoteValue(quote)}</span>
          <span
            className={`font-mono text-sm font-bold ${quote.change >= 0 ? "text-accent-green" : "text-error"}`}
          >
            {formatQuoteChange(quote)}
          </span>
          <span className="text-xs text-text-secondary">aggiornato al {quote.date}</span>
        </div>
      ) : (
        <p className="mt-3 max-w-reading text-sm text-text-secondary">
          Dati e grafico per {instrument.symbol} arriveranno con il catalogo asset completo. Questa pagina
          rappresenta già la struttura definitiva usata da Markets, Watchlist e Portfolio per ogni strumento.
        </p>
      )}

      {instrument.assetId && (
        <Link
          href="/workbench"
          className="mt-4 inline-flex items-center gap-2 rounded-card border border-bg-card/60 px-3 py-1.5 text-xs font-bold text-text-secondary transition duration-150 ease-in-out hover:border-accent-purple/40 hover:text-text-primary"
        >
          Apri in Workbench →
        </Link>
      )}
    </div>
  );
}
