import type { MarketInstrumentStatus } from "@/types/markets";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface MarketStatusBadgeProps {
  status: MarketInstrumentStatus;
}

/**
 * Indicatore di stato per uno strumento del catalogo Markets: pallino verde
 * per `"live"`, badge "Soon" per `"soon"`. Condiviso da `MarketListRow` e
 * dai risultati Asset della Search Overlay per restare visivamente coerenti.
 */
export function MarketStatusBadge({ status }: MarketStatusBadgeProps) {
  if (status === "live") {
    return <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-label="Dati live" />;
  }

  return <SoonBadge />;
}
