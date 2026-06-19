import Link from "next/link";
import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteValue, formatQuoteChange } from "@/lib/market/ticker";

interface MarketsTopMoversProps {
  quotes: TickerQuote[];
}

function MoverRow({ q, rank }: { q: TickerQuote; rank: number }) {
  const pos = q.change >= 0;
  return (
    <Link
      href={`/asset/${q.id}`}
      className={`flex items-center gap-3 border-l-2 px-3 py-1.5 transition hover:bg-bg-hover group ${
        pos ? "border-positive/40" : "border-negative/40"
      }`}
    >
      <span className="w-3 shrink-0 font-mono text-[10px] text-text-disabled">{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs font-bold text-text-primary group-hover:text-cyan transition">
          {q.id}
        </p>
        <p className="text-[10px] text-text-muted truncate">{q.label}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-[11px] text-text-secondary">{formatQuoteValue(q)}</p>
      </div>
      <p
        className={`shrink-0 w-16 text-right font-mono text-xs font-bold tabular-nums ${
          pos ? "text-positive" : "text-negative"
        }`}
      >
        {formatQuoteChange(q)}
      </p>
    </Link>
  );
}

export function MarketsTopMovers({ quotes }: MarketsTopMoversProps) {
  const active = quotes
    .filter((q) => q.change !== 0 && q.source !== "local-static")
    .sort((a, b) => b.changePercent - a.changePercent);

  if (active.length < 2) return null;

  const moverCount = Math.min(5, Math.floor(active.length / 2));
  const gainers = active.slice(0, moverCount);
  const losers = active.slice(-moverCount).reverse();

  return (
    <section id="heatmap" className="rounded-card border border-bg-border/15 bg-bg-card/60">
      <header className="flex items-center justify-between border-b border-bg-border/15 px-5 py-2.5">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Top Movers
        </h2>
        <span className="text-[10px] text-text-disabled">{active.length} active today</span>
      </header>
      <div className="grid grid-cols-1 divide-y divide-bg-border/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="py-2">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-positive">
            ▲ Top Gainers
          </p>
          <div>
            {gainers.map((q, i) => <MoverRow key={q.id} q={q} rank={i + 1} />)}
          </div>
        </div>
        <div className="py-2 sm:pl-0">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-negative">
            ▼ Top Losers
          </p>
          <div>
            {losers.map((q, i) => <MoverRow key={q.id} q={q} rank={i + 1} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
