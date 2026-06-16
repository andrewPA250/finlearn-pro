import Link from "next/link";
import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteValue, formatQuoteChange } from "@/lib/market/ticker";

interface MarketsTopMoversProps {
  quotes: TickerQuote[];
}

function MoverRow({ q }: { q: TickerQuote }) {
  const pos = q.change >= 0;
  return (
    <Link
      href={`/asset/${q.id}`}
      className="flex items-center justify-between gap-2 rounded-md px-2 py-2 transition hover:bg-bg-hover group"
    >
      <div className="min-w-0">
        <p className="font-mono text-xs font-bold text-text-primary group-hover:text-cyan transition">
          {q.id}
        </p>
        <p className="text-[10px] text-text-muted truncate">{q.label}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-xs font-bold text-text-primary">{formatQuoteValue(q)}</p>
        <p className={`font-mono text-[11px] font-bold ${pos ? "text-positive" : "text-negative"}`}>
          {formatQuoteChange(q)}
        </p>
      </div>
    </Link>
  );
}

export function MarketsTopMovers({ quotes }: MarketsTopMoversProps) {
  const active = quotes
    .filter((q) => q.change !== 0 && q.source !== "local-static")
    .sort((a, b) => b.changePercent - a.changePercent);

  if (active.length < 2) return null;

  const gainers = active.slice(0, 3);
  const losers = active.slice(-3).reverse();

  return (
    <section id="heatmap" className="rounded-card border border-bg-border bg-bg-card p-5">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-4">
        Top Movers
      </h2>
      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <p className="text-[10px] font-semibold text-positive mb-2">▲ Gainers</p>
          <div className="space-y-0.5">
            {gainers.map((q) => <MoverRow key={q.id} q={q} />)}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-negative mb-2">▼ Losers</p>
          <div className="space-y-0.5">
            {losers.map((q) => <MoverRow key={q.id} q={q} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
