import type { AssetId } from "@/types/market";
import { ASSET_FILE_NAMES, ASSET_SOURCE_LABELS, ASSET_LABELS, REQUIRED_RANGE_LABEL } from "@/lib/market";

interface EmptyStateProps {
  missingAssets: AssetId[];
}

/**
 * Stato vuoto mostrato quando uno o più asset richiesti per la
 * combinazione/timeframe corrente non hanno ancora dati reali sufficienti
 * in `public/data/*.json` (vedi `hasSufficientData` in `lib/market.ts`).
 * Non genera mai un grafico con dati placeholder/sintetici.
 */
export function EmptyState({ missingAssets }: EmptyStateProps) {
  return (
    <div className="rounded-card border border-error/40 bg-bg-card p-6 text-sm text-text-secondary">
      <p className="mb-3 text-base font-bold text-text-primary">Dati reali non ancora caricati</p>
      <p className="mb-4">
        Per mostrare questo grafico servono dati storici reali (range minimo{" "}
        {REQUIRED_RANGE_LABEL}) per i seguenti asset. I file attuali in{" "}
        <code className="font-mono text-text-primary">public/data/</code> non coprono un intervallo
        sufficiente per il periodo selezionato (contengono dati placeholder).
      </p>
      <ul className="flex flex-col gap-3">
        {missingAssets.map((asset) => (
          <li key={asset} className="rounded-card border border-bg-sidebar bg-bg-primary p-3 font-mono text-xs">
            <div className="text-text-primary">
              public/data/{ASSET_FILE_NAMES[asset]} — {ASSET_LABELS[asset]}
            </div>
            <div className="mt-1 text-text-secondary">
              Fonte: <span className="text-accent-purple">{ASSET_SOURCE_LABELS[asset]}</span>
            </div>
            <div className="mt-1 text-text-secondary">
              Formato: {"{ \"date\": \"YYYY-MM-DD\", \"value\": number }[]"}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4">
        Per generare i file dal CSV esportato da FRED, usa{" "}
        <code className="font-mono text-text-primary">scripts/import-market-data.mjs</code> (vedi
        SESSION_NOTES.md).
      </p>
    </div>
  );
}
