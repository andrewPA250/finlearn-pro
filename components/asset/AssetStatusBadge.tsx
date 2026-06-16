import type { MarketInstrumentStatus } from "@/types/markets";
import type { DataFreshness } from "@/lib/providers/types";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface AssetStatusBadgeProps {
  status: MarketInstrumentStatus;
  freshness?: DataFreshness;
}

/**
 * Badge di stato per l'header della pagina asset (Step 13.1, aggiornato 13.2).
 *
 * | freshness       | Colore  | Testo          |
 * |-----------------|---------|----------------|
 * | live            | verde   | Live           |
 * | near-live       | teal    | Near Live      |
 * | delayed         | ambra   | Delayed        |
 * | market-closed   | grigio+ | Market Closed  |
 * | eod             | verde   | EOD            |
 * | null/unavailable| grigio  | Unavailable    |
 * | soon (status)   | blu     | Soon           |
 */
export function AssetStatusBadge({ status, freshness }: AssetStatusBadgeProps) {
  if (status === "soon") return <SoonBadge />;

  switch (freshness) {
    case "live":
      return (
        <span className="rounded-full bg-accent-green/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-green">
          Live
        </span>
      );

    case "near-live":
      return (
        <span className="rounded-full bg-accent-green/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-green">
          Near Live
        </span>
      );

    case "delayed":
      return (
        <span className="rounded-full bg-accent-amber/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-amber">
          Delayed
        </span>
      );

    case "market-closed":
      return (
        <span className="rounded-full bg-text-secondary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
          Market Closed
        </span>
      );

    case "eod":
      return (
        <span className="rounded-full bg-accent-green/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-green">
          EOD
        </span>
      );

    default:
      // Provider registrato ma nessun dato a runtime
      return (
        <span className="rounded-full bg-bg-sidebar px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary/60">
          Unavailable
        </span>
      );
  }
}
