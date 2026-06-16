import type { MarketInstrumentStatus } from "@/types/markets";
import type { DataFreshness } from "@/lib/providers/types";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface MarketStatusBadgeProps {
  status: MarketInstrumentStatus;
  freshness?: DataFreshness;
}

/**
 * Indicatore di stato (dot) per uno strumento del catalogo Markets (Step 13.2).
 *
 * | freshness       | Dot                           |
 * |-----------------|-------------------------------|
 * | live            | verde brillante               |
 * | near-live       | verde                         |
 * | eod             | verde                         |
 * | delayed         | ambra                         |
 * | market-closed   | grigio chiaro                 |
 * | null/unavailable| grigio scuro                  |
 * | soon (status)   | badge "Soon"                  |
 */
export function MarketStatusBadge({ status, freshness }: MarketStatusBadgeProps) {
  if (status === "soon") return <SoonBadge />;

  switch (freshness) {
    case "live":
      return <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-label="Live" />;

    case "near-live":
      return <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-label="Near Live" />;

    case "eod":
      return <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-label="EOD" />;

    case "delayed":
      return <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" aria-label="Delayed" />;

    case "market-closed":
      return <span className="h-1.5 w-1.5 rounded-full bg-text-secondary/40" aria-label="Market Closed" />;

    default:
      return <span className="h-1.5 w-1.5 rounded-full bg-text-secondary/20" aria-label="Unavailable" />;
  }
}
