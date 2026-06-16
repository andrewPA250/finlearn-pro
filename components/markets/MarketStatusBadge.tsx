import type { MarketInstrumentStatus } from "@/types/markets";
import type { DataFreshness } from "@/lib/providers/types";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface MarketStatusBadgeProps {
  status: MarketInstrumentStatus;
  freshness?: DataFreshness;
}

/**
 * Indicatore di stato per uno strumento del catalogo Markets.
 * - "soon" → badge "Soon"
 * - "live"/"delayed" + freshness "eod" o "live" → pallino verde
 * - "live"/"delayed" + freshness "delayed" → pallino ambra (dati ritardati)
 * - "live"/"delayed" + nessuna freshness (dati temporaneamente non disponibili) → pallino grigio
 */
export function MarketStatusBadge({ status, freshness }: MarketStatusBadgeProps) {
  if (status === "soon") return <SoonBadge />;

  if (!freshness) {
    return <span className="h-1.5 w-1.5 rounded-full bg-text-secondary/40" aria-label="Non disponibile" />;
  }

  if (freshness === "delayed") {
    return <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" aria-label="Dati ritardati" />;
  }

  return <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-label="Dati EOD" />;
}
