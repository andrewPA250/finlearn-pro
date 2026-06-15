import type { MarketInstrumentStatus } from "@/types/markets";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface AssetStatusBadgeProps {
  status: MarketInstrumentStatus;
}

/**
 * Badge di stato per l'header della pagina asset: "Dati EOD" (serie storiche
 * di fine giornata, reali) per `"live"`, "Soon" per `"soon"`. Variante più
 * descrittiva di `MarketStatusBadge` (usato nelle liste/Search): qui serve a
 * comunicare la natura del dato, non solo la sua disponibilità.
 */
export function AssetStatusBadge({ status }: AssetStatusBadgeProps) {
  if (status === "live") {
    return (
      <span className="rounded-full bg-accent-green/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-green">
        Dati EOD
      </span>
    );
  }

  return <SoonBadge />;
}
