import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteChange, formatQuoteValue } from "@/lib/market/ticker";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface MarketListRowProps {
  instrument: MarketInstrument;
  /** Quotazione reale, presente solo per strumenti `status: "live"` con `assetId` collegato. */
  quote?: TickerQuote;
}

const rowClassName =
  "grid grid-cols-[1fr_5.5rem_5rem_1.75rem] items-center gap-2 px-4 py-2 text-xs transition duration-150 ease-in-out";

/**
 * Riga del "Market List Pattern" (Step 10.5): simbolo, nome, valore,
 * variazione, stato. Componente generico riusabile in futuro per Watchlist
 * e Portfolio — basta passare uno `MarketInstrument` (+ quotazione
 * opzionale). Gli strumenti `"live"` collegano a `/asset/[symbol]`, quelli
 * `"soon"` restano non interattivi con un badge "Soon".
 */
export function MarketListRow({ instrument, quote }: MarketListRowProps) {
  const live = instrument.status === "live" && quote !== undefined;

  const content = (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <span className="font-mono font-bold text-text-primary">{instrument.symbol}</span>
        <span className="truncate text-text-secondary">{instrument.name}</span>
      </div>
      <span className="text-right font-mono text-text-primary">
        {live ? formatQuoteValue(quote) : <span className="text-text-secondary/40">—</span>}
      </span>
      <span
        className={`text-right font-mono font-bold ${
          live ? (quote.change >= 0 ? "text-accent-green" : "text-error") : "text-text-secondary/40"
        }`}
      >
        {live ? formatQuoteChange(quote) : "—"}
      </span>
      <span className="flex justify-end">
        {live ? (
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-label="Dati live" />
        ) : (
          <SoonBadge />
        )}
      </span>
    </>
  );

  if (live) {
    return (
      <Link href={`/asset/${instrument.symbol}`} className={`${rowClassName} hover:bg-bg-sidebar`}>
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
