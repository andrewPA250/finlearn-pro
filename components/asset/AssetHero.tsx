import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { DataFreshness } from "@/lib/providers/types";
import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteValue, formatQuoteChangeDetail } from "@/lib/market/ticker";
import { AssetStatusBadge } from "@/components/asset/AssetStatusBadge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { LocalTime } from "@/components/ui/LocalTime";

interface AssetHeroProps {
  instrument: MarketInstrument;
  categoryLabel: string;
  quote: TickerQuote | null;
}

// ---------------------------------------------------------------------------
// Tooltip per ogni stato freshness
// ---------------------------------------------------------------------------
const FRESHNESS_TOOLTIPS: Record<string, string> = {
  live:            "Dato aggiornato in tempo quasi reale tramite streaming.",
  "near-live":     "Dato aggiornato frequentemente (crypto/forex 24/7). Può avere un piccolo ritardo rispetto al mercato reale.",
  delayed:         "Dato quasi-realtime via Yahoo Finance durante orario di mercato regolare. Aggiornato ogni ~60 secondi.",
  "market-closed": "Il mercato è attualmente chiuso. Il dato mostra l'ultimo prezzo disponibile dalla sessione precedente.",
  eod:             "Ultimo dato disponibile di fine giornata.",
  unavailable:     "Il provider attuale non restituisce dati per questo strumento.",
};

// ---------------------------------------------------------------------------
// Helper: etichetta della fonte
// ---------------------------------------------------------------------------
function getSourceLabel(source: string): string {
  switch (source) {
    case "yahoo":            return "Yahoo Finance";
    case "finnhub":          return "Finnhub";
    case "coingecko":        return "CoinGecko";
    case "frankfurter-ecb":  return "BCE / Frankfurter";
    case "local-static":     return "Local";
    default:                 return source;
  }
}

// ---------------------------------------------------------------------------
// Helper: etichetta prefisso timestamp ("Updated" / "Last Trade")
// ---------------------------------------------------------------------------
function getTimestampLabel(freshness: DataFreshness): string {
  return freshness === "market-closed" ? "Last Trade" : "Updated";
}

// ---------------------------------------------------------------------------
// Helper: formattazione data senza orario (per EOD e fallback)
// ---------------------------------------------------------------------------
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateStr: string): string {
  const [year, monthStr, dayStr] = dateStr.split("-");
  const month = MONTHS[parseInt(monthStr, 10) - 1] ?? monthStr;
  return `${parseInt(dayStr, 10)} ${month} ${year}`;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Header della pagina asset — Step 13.1 + Step 13.2.
 *
 * Gerarchia visiva in 4 blocchi:
 * 1. Breadcrumb verso /markets
 * 2. Riga metadati: categoria · [badge][ⓘ] · fonte · timestamp contestuale
 * 3. Nome asset + simbolo
 * 4. Prezzo grande + variazione assoluta e percentuale
 *
 * Timestamp contestuale per freshness:
 * - near-live / delayed  → "Updated HH:MM"
 * - market-closed        → "Last Trade DD Mon HH:MM"
 * - eod                  → "Updated DD Mon YYYY"
 */
export function AssetHero({ instrument, categoryLabel, quote }: AssetHeroProps) {
  const freshness = quote?.freshness;
  const tooltipText = freshness ? (FRESHNESS_TOOLTIPS[freshness] ?? "") : "";

  return (
    <div className="animate-fade-in-up">
      {/* 1. Breadcrumb */}
      <Link
        href="/markets"
        className="text-xs font-bold text-text-secondary transition duration-150 ease-in-out hover:text-text-primary"
      >
        ← Markets
      </Link>

      {/* 2. Riga metadati */}
      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-xs font-bold uppercase tracking-wide text-accent-purple">
          {categoryLabel}
        </span>

        <span className="text-text-secondary/30">·</span>

        <span className="flex items-center gap-0.5">
          <AssetStatusBadge
            status={instrument.status}
            freshness={freshness as DataFreshness | undefined}
          />
          {tooltipText && (
            <InfoTooltip
              text={tooltipText}
              label={`Qualità dato: ${freshness}`}
            />
          )}
        </span>

        {quote && (
          <>
            <span className="text-text-secondary/30">·</span>
            <span className="text-xs text-text-secondary">
              {getSourceLabel(quote.source)}
            </span>
            <span className="text-text-secondary/30">·</span>
            <span className="text-xs text-text-secondary">
              {getTimestampLabel(freshness!)}
              {" "}
              {quote.timestamp ? (
                /* Provider con timestamp esatto (Finnhub, CoinGecko) */
                <LocalTime
                  timestamp={quote.timestamp}
                  format={freshness === "market-closed" ? "datetime" : "time"}
                />
              ) : (
                /* EOD (Frankfurter, local-static): solo data, nessun orario */
                formatDate(quote.date)
              )}
            </span>
          </>
        )}
      </div>

      {/* 3. Nome + simbolo */}
      <div className="mt-3">
        <h1 className="text-2xl font-bold text-text-primary">{instrument.name}</h1>
        <p className="mt-0.5 font-mono text-sm font-medium text-text-secondary">
          {instrument.symbol}
        </p>
      </div>

      {/* 4. Prezzo + variazione */}
      {quote ? (
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-3xl font-bold tracking-tight text-text-primary">
            {formatQuoteValue(quote)}
          </span>
          <span
            className={`font-mono text-sm font-bold ${
              quote.change >= 0 ? "text-accent-green" : "text-error"
            }`}
          >
            {formatQuoteChangeDetail(quote)}
          </span>
        </div>
      ) : (
        <p className="mt-3 max-w-reading text-sm text-text-secondary">
          {instrument.status === "soon"
            ? `Dati e grafico per ${instrument.symbol} arriveranno con il catalogo asset completo.`
            : `Dati temporaneamente non disponibili per ${instrument.symbol}.`}
        </p>
      )}

      {/* CTA Workbench — solo per asset con serie storica locale */}
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
