import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteChange, formatQuoteValue } from "@/lib/market/ticker";
import { MarketStatusBadge } from "@/components/markets/MarketStatusBadge";

interface MarketListRowProps {
  instrument: MarketInstrument;
  /** Quotazione reale, presente per strumenti con provider (status "live" o "delayed"). */
  quote?: TickerQuote;
}

const rowClassName =
  "grid grid-cols-[1fr_5.5rem_5rem_1.75rem] items-center gap-2 px-3 py-1.5 text-xs transition duration-150 ease-in-out";

/**
 * Riga del "Market List Pattern": simbolo, nome, valore, variazione, stato.
 * Gli strumenti con provider ("live"/"delayed") sono cliccabili e collegano
 * a `/asset/[symbol]`. Gli strumenti "soon" restano non interattivi.
 */
export function MarketListRow({ instrument, quote }: MarketListRowProps) {
  const hasProvider = instrument.status !== "soon";
  const hasData = hasProvider && quote !== undefined;

  const content = (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <span className="font-mono font-bold text-text-primary">{instrument.symbol}</span>
        <span className="truncate text-text-secondary">{instrument.name}</span>
      </div>
      <span className="text-right font-mono text-text-primary">
        {hasData ? formatQuoteValue(quote) : <span className="text-text-secondary/40">—</span>}
      </span>
      <span
        className={`text-right font-mono font-bold ${
          hasData ? (quote.change >= 0 ? "text-positive" : "text-negative") : "text-text-secondary/40"
        }`}
      >
        {hasData ? formatQuoteChange(quote) : "—"}
      </span>
      <span className="flex justify-end">
        <MarketStatusBadge status={instrument.status} freshness={quote?.freshness} />
      </span>
    </>
  );

  if (hasProvider) {
    return (
      <Link href={`/asset/${instrument.symbol}`} className={`${rowClassName} hover:bg-bg-hover`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`${rowClassName} opacity-60`} aria-disabled="true">
      {content}
    </div>
  );
}
