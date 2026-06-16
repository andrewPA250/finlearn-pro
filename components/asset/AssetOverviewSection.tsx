import type { MarketInstrument, MarketInstrumentStatus } from "@/types/markets";
import type { DataFreshness } from "@/lib/providers/types";
import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteChange, formatQuoteValue } from "@/lib/market/ticker";

function getStatusLabel(status: MarketInstrumentStatus, freshness?: DataFreshness): string {
  if (status === "soon") return "Soon";
  switch (freshness) {
    case "eod": return "Dati EOD";
    case "delayed": return "Dati ritardati";
    case "live": return "Live";
    default: return "Non disponibile";
  }
}

interface AssetOverviewSectionProps {
  instrument: MarketInstrument;
  categoryLabel: string;
  quote: TickerQuote | null;
}

interface OverviewFact {
  label: string;
  value: string;
}

/**
 * Sezione "Overview": riepilogo dei dati anagrafici dello strumento (simbolo,
 * nome, categoria, stato) e, se disponibile, della quotazione (valore,
 * variazione, data). Stessi campi per ogni strumento del catalogo: un futuro
 * provider dati aggiunge solo righe a `facts`, non una nuova struttura.
 */
export function AssetOverviewSection({ instrument, categoryLabel, quote }: AssetOverviewSectionProps) {
  const facts: OverviewFact[] = [
    { label: "Simbolo", value: instrument.symbol },
    { label: "Nome", value: instrument.name },
    { label: "Categoria", value: categoryLabel },
    { label: "Stato", value: getStatusLabel(instrument.status, quote?.freshness) },
  ];

  if (quote) {
    facts.push(
      { label: "Valore", value: formatQuoteValue(quote) },
      { label: "Variazione", value: formatQuoteChange(quote) },
      { label: "Aggiornato al", value: quote.date }
    );
  }

  return (
    <section className="rounded-card border border-bg-sidebar bg-bg-card p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">Overview</h2>
      <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-[11px] text-text-secondary/60">{fact.label}</dt>
            <dd className="mt-0.5 truncate font-mono text-sm text-text-primary">{fact.value}</dd>
          </div>
        ))}
      </dl>
      {!quote && (
        <p className="mt-4 max-w-reading text-sm text-text-secondary">
          Dati e grafico per {instrument.symbol} arriveranno con il catalogo asset completo.
        </p>
      )}
    </section>
  );
}
