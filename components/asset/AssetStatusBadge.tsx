import type { MarketInstrumentStatus } from "@/types/markets";
import type { DataFreshness } from "@/lib/providers/types";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface AssetStatusBadgeProps {
  status: MarketInstrumentStatus;
  freshness?: DataFreshness;
}

/**
 * Badge di stato per l'header della pagina asset.
 * - "soon" → badge "Soon"
 * - freshness "eod" → "Dati EOD" (verde)
 * - freshness "delayed" → "Dati ritardati" (ambra)
 * - freshness "live" → "Live" (verde brillante)
 * - provider presente ma nessun dato → "Non disponibile" (grigio)
 */
export function AssetStatusBadge({ status, freshness }: AssetStatusBadgeProps) {
  if (status === "soon") return <SoonBadge />;

  if (freshness === "eod") {
    return (
      <span className="rounded-full bg-accent-green/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-green">
        Dati EOD
      </span>
    );
  }

  if (freshness === "delayed") {
    return (
      <span className="rounded-full bg-accent-amber/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-amber">
        Dati ritardati
      </span>
    );
  }

  if (freshness === "live") {
    return (
      <span className="rounded-full bg-accent-green/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-green">
        Live
      </span>
    );
  }

  // Provider registrato ma nessun dato a runtime
  return (
    <span className="rounded-full bg-bg-sidebar px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary/60">
      Non disponibile
    </span>
  );
}
