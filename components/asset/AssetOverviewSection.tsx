import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteValue, formatQuoteChangeDetail } from "@/lib/market/ticker";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

interface AssetOverviewSectionProps {
  instrument: MarketInstrument;
  categoryLabel: string;
  quote: TickerQuote | null;
}

function getSourceLabel(source: string): string {
  switch (source) {
    case "finnhub": return "Finnhub";
    case "coingecko": return "CoinGecko";
    case "frankfurter-ecb": return "BCE / Frankfurter";
    case "local-static": return "Local";
    default: return source;
  }
}

interface OverviewFact {
  label: string;
  value: string;
  tooltip?: string;
}

/**
 * Sezione Overview — Step 13.1.
 *
 * Mostra solo dati reali: prezzo, variazioni, fonte, categoria.
 * Nessun campo vuoto o inventato. Per asset "soon" mostra
 * un minimal state con solo la categoria.
 */
export function AssetOverviewSection({ instrument, categoryLabel, quote }: AssetOverviewSectionProps) {
  const facts: OverviewFact[] = [];

  if (quote) {
    facts.push(
      {
        label: "Prezzo",
        value: formatQuoteValue(quote),
        tooltip: "Ultimo prezzo disponibile fornito dal provider dati.",
      },
      {
        label: "Variazione",
        value: formatQuoteChangeDetail(quote),
        tooltip: "Variazione assoluta e percentuale rispetto al punto di riferimento del provider.",
      },
      {
        label: "Fonte",
        value: getSourceLabel(quote.source),
        tooltip: "Provider che ha fornito questo dato.",
      },
    );
  }

  facts.push({
    label: "Categoria",
    value: categoryLabel,
  });

  return (
    <section className="rounded-card border border-bg-sidebar bg-bg-card p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">Overview</h2>

      <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="flex items-center gap-0.5 text-[11px] text-text-secondary/60">
              {fact.label}
              {fact.tooltip && (
                <InfoTooltip text={fact.tooltip} label={`Informazioni su: ${fact.label}`} />
              )}
            </dt>
            <dd className="mt-0.5 truncate font-mono text-sm text-text-primary">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {!quote && (
        <p className="mt-4 max-w-reading text-sm text-text-secondary">
          {instrument.status === "soon"
            ? `Dati e grafico per ${instrument.symbol} arriveranno con il catalogo asset completo.`
            : `Dati temporaneamente non disponibili per ${instrument.symbol}.`}
        </p>
      )}
    </section>
  );
}
