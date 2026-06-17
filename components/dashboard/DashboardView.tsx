import Link from "next/link";
import type { TickerQuote } from "@/lib/market/ticker";
import type { NewsResult } from "@/lib/assetNews";
import { formatQuoteValue, formatQuoteChange } from "@/lib/market/ticker";
import { MARKET_CATEGORIES, getInstrumentsByCategory } from "@/lib/markets/catalog";
import { WatchlistWidget } from "@/components/dashboard/WatchlistWidget";

interface DashboardViewProps {
  tickerQuotes: TickerQuote[];
  newsResult: NewsResult;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CAT_LABELS: Record<string, string> = {
  equity: "Stocks",
  etf: "ETFs",
  index: "Indices",
  crypto: "Crypto",
  forex: "Forex",
  commodity: "Commodities",
  bond: "Bonds",
};

function buildQuoteMap(quotes: TickerQuote[]): Record<string, TickerQuote> {
  return Object.fromEntries(quotes.map((q) => [q.id, q]));
}

function getMarketStatus(spx: TickerQuote | undefined): {
  open: boolean;
  label: string;
  dot: string;
} {
  if (!spx) return { open: false, label: "Status unknown", dot: "bg-text-muted" };
  const f = spx.freshness;
  if (f === "delayed" || f === "near-live" || f === "live")
    return { open: true, label: "US Market Open", dot: "bg-positive" };
  if (f === "market-closed")
    return { open: false, label: "US Market Closed", dot: "bg-negative" };
  return { open: false, label: "After Hours", dot: "bg-caution" };
}

function heatmapBg(avg: number | null): string {
  if (avg === null) return "bg-bg-hover border-bg-border text-text-muted";
  if (avg > 1.5) return "bg-positive/20 border-positive/30 text-positive";
  if (avg > 0) return "bg-positive/10 border-positive/20 text-positive";
  if (avg > -1.5) return "bg-negative/10 border-negative/20 text-negative";
  return "bg-negative/20 border-negative/30 text-negative";
}

function formatAge(unix: number): string {
  const diff = Math.floor((Date.now() - unix * 1000) / 3_600_000);
  if (diff < 1) return "< 1h ago";
  if (diff < 24) return `${diff}h ago`;
  return `${Math.floor(diff / 24)}d ago`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KeyQuoteRow({
  symbol,
  label,
  qMap,
}: {
  symbol: string;
  label: string;
  qMap: Record<string, TickerQuote>;
}) {
  const q = qMap[symbol];
  if (!q) return null;
  const pos = q.change >= 0;
  return (
    <Link
      href={`/asset/${symbol}`}
      className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition hover:bg-bg-hover"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-xs font-bold text-text-primary w-16 shrink-0">{symbol}</span>
        <span className="text-xs text-text-muted truncate hidden sm:block">{label}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-xs font-bold text-text-primary">{formatQuoteValue(q)}</span>
        <span className={`font-mono text-[11px] font-bold w-16 text-right ${pos ? "text-positive" : "text-negative"}`}>
          {formatQuoteChange(q)}
        </span>
      </div>
    </Link>
  );
}

function MarketOverviewCard({ qMap }: { qMap: Record<string, TickerQuote> }) {
  const items = [
    { symbol: "SPX",    label: "S&P 500"    },
    { symbol: "NDX",    label: "Nasdaq 100" },
    { symbol: "DJI",    label: "Dow Jones"  },
    { symbol: "BTCUSD", label: "Bitcoin"    },
    { symbol: "XAUUSD", label: "Gold"       },
  ];

  return (
    <section className="rounded-card border border-bg-border bg-bg-card p-5">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
        Market Overview
      </h2>
      <div className="space-y-0.5">
        {items.map((i) => (
          <KeyQuoteRow key={i.symbol} symbol={i.symbol} label={i.label} qMap={qMap} />
        ))}
      </div>
    </section>
  );
}

function MarketStatusCard({
  quotes,
  qMap,
}: {
  quotes: TickerQuote[];
  qMap: Record<string, TickerQuote>;
}) {
  const spx = qMap["SPX"];
  const vix = qMap["VIX"];
  const status = getMarketStatus(spx);

  const withChange = quotes.filter((q) => q.change !== 0 && q.source !== "local-static");
  const advancing = withChange.filter((q) => q.change > 0).length;
  const declining = withChange.filter((q) => q.change < 0).length;
  const total = advancing + declining;
  const advPct = total > 0 ? Math.round((advancing / total) * 100) : 50;

  const vixLevel =
    !vix ? "—"
    : vix.value < 15 ? "Low"
    : vix.value < 20 ? "Moderate"
    : vix.value < 30 ? "Elevated"
    : "High";

  const vixColor =
    !vix ? "text-text-muted"
    : vix.value < 15 ? "text-positive"
    : vix.value < 20 ? "text-caution"
    : "text-negative";

  return (
    <section className="rounded-card border border-bg-border bg-bg-card p-5">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-4">
        Market Pulse
      </h2>

      {/* Status */}
      <div className="flex items-center gap-2 mb-5">
        <span className={`h-2 w-2 rounded-full ${status.dot} ${status.open ? "animate-pulse" : ""}`} />
        <span className="text-sm font-semibold text-text-primary">{status.label}</span>
      </div>

      {/* Breadth */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] text-text-muted mb-1.5">
          <span>↑ {advancing} advancing</span>
          <span>{declining} declining ↓</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-positive transition-all"
            style={{ width: `${advPct}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-bg-sidebar/60 px-3 py-2.5">
          <p className="text-[10px] text-text-muted mb-0.5">VIX</p>
          <p className="font-mono text-sm font-bold text-text-primary">
            {vix ? vix.value.toFixed(2) : "—"}
          </p>
          <p className={`text-[10px] font-medium ${vixColor}`}>{vixLevel}</p>
        </div>
        <div className="rounded-md bg-bg-sidebar/60 px-3 py-2.5">
          <p className="text-[10px] text-text-muted mb-0.5">Assets tracked</p>
          <p className="font-mono text-sm font-bold text-text-primary">{quotes.length}</p>
          <p className="text-[10px] text-text-muted">across 7 classes</p>
        </div>
      </div>
    </section>
  );
}

function CategoryHeatmap({ qMap }: { qMap: Record<string, TickerQuote> }) {
  const categories = MARKET_CATEGORIES.map((cat) => {
    const instruments = getInstrumentsByCategory(cat.id);
    const catQuotes = instruments
      .map((i) => qMap[i.symbol])
      .filter((q): q is TickerQuote => q != null && q.change !== 0);
    const avg =
      catQuotes.length > 0
        ? catQuotes.reduce((s, q) => s + q.changePercent, 0) / catQuotes.length
        : null;
    return { ...cat, avg, count: catQuotes.length };
  });

  return (
    <section className="rounded-card border border-bg-border bg-bg-card p-5">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-4">
        Market Heatmap
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/markets`}
            className={`rounded-md border p-3 transition hover:opacity-80 ${heatmapBg(cat.avg)}`}
          >
            <p className="text-xs font-semibold">{CAT_LABELS[cat.id] ?? cat.label}</p>
            <p className="font-mono text-base font-bold mt-0.5">
              {cat.avg != null
                ? `${cat.avg >= 0 ? "+" : ""}${cat.avg.toFixed(2)}%`
                : "—"}
            </p>
            <p className="text-[10px] opacity-70 mt-0.5">{cat.count} assets</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TopMoversCard({
  quotes,
}: {
  quotes: TickerQuote[];
}) {
  const active = quotes
    .filter((q) => q.change !== 0 && q.source !== "local-static")
    .sort((a, b) => b.changePercent - a.changePercent);

  const gainers = active.slice(0, 5);
  const losers = active.slice(-5).reverse();

  function MoverRow({ q, side }: { q: TickerQuote; side: "gain" | "loss" }) {
    return (
      <Link
        href={`/asset/${q.id}`}
        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition hover:bg-bg-hover"
      >
        <span className="font-mono text-xs font-bold text-text-primary truncate">{q.id}</span>
        <span
          className={`font-mono text-[11px] font-bold shrink-0 ${
            side === "gain" ? "text-positive" : "text-negative"
          }`}
        >
          {q.changePercent >= 0 ? "+" : ""}
          {q.changePercent.toFixed(2)}%
        </span>
      </Link>
    );
  }

  return (
    <section className="rounded-card border border-bg-border bg-bg-card p-5 md:col-span-2">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-4">
        Top Movers
      </h2>
      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <p className="text-[10px] font-semibold text-positive mb-2 flex items-center gap-1">
            <span>▲</span> Top Gainers
          </p>
          <div className="space-y-0.5">
            {gainers.length > 0
              ? gainers.map((q) => <MoverRow key={q.id} q={q} side="gain" />)
              : <p className="text-xs text-text-muted py-2">No data</p>}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-negative mb-2 flex items-center gap-1">
            <span>▼</span> Top Losers
          </p>
          <div className="space-y-0.5">
            {losers.length > 0
              ? losers.map((q) => <MoverRow key={q.id} q={q} side="loss" />)
              : <p className="text-xs text-text-muted py-2">No data</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsWidget({ newsResult }: { newsResult: NewsResult }) {
  const items = newsResult.topNews.slice(0, 5);

  return (
    <section className="rounded-card border border-bg-border bg-bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Market News
        </h2>
        {items.length > 0 && (
          <span className="text-[10px] text-text-muted/50">via Finnhub</span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-text-muted py-4">News unavailable</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <p className="text-xs font-medium leading-snug text-text-primary group-hover:text-cyan line-clamp-2 transition">
                {item.headline}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-text-muted/60">
                {item.source && <span>{item.source}</span>}
                {item.source && item.datetime > 0 && <span>·</span>}
                {item.datetime > 0 && <span>{formatAge(item.datetime)}</span>}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function AIInsightWidget() {
  return (
    <section className="rounded-card border border-bg-border bg-bg-card p-5 flex flex-col">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-4">
        AI Insights
      </h2>
      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
        <div className="h-9 w-9 rounded-full bg-color-ai/10 flex items-center justify-center mb-3">
          <span className="text-lg text-color-ai">✦</span>
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">AI Market Analysis</p>
        <p className="text-xs text-text-muted mb-4">
          Portfolio insights, risk analysis, and smart alerts
        </p>
        <span className="rounded px-2.5 py-1 text-[10px] font-bold bg-color-ai/10 text-color-ai">
          Coming Soon
        </span>
      </div>
    </section>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function DashboardView({ tickerQuotes, newsResult }: DashboardViewProps) {
  const qMap = buildQuoteMap(tickerQuotes);
  const spx = qMap["SPX"];
  const status = getMarketStatus(spx);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-platform flex flex-col gap-5 px-4 py-6 md:px-6">
      {/* Page header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2 mb-1">
          <span className={`h-2 w-2 rounded-full ${status.dot} ${status.open ? "animate-pulse" : ""}`} />
          <span className="text-xs font-medium text-text-muted">{status.label}</span>
          <span className="text-text-muted/30">·</span>
          <span className="text-xs text-text-muted">{today}</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Market intelligence at a glance
        </p>
      </div>

      {/* Row 1: Overview + Pulse */}
      <div
        className="grid gap-5 md:grid-cols-2 animate-fade-in-up"
        style={{ animationDelay: "40ms" }}
      >
        <MarketOverviewCard qMap={qMap} />
        <MarketStatusCard quotes={tickerQuotes} qMap={qMap} />
      </div>

      {/* Row 2: Heatmap + Top Movers */}
      <div
        className="grid gap-5 md:grid-cols-3 animate-fade-in-up"
        style={{ animationDelay: "80ms" }}
      >
        <CategoryHeatmap qMap={qMap} />
        <TopMoversCard quotes={tickerQuotes} />
      </div>

      {/* Row 3: Watchlist + News + AI */}
      <div
        className="grid gap-5 md:grid-cols-3 animate-fade-in-up"
        style={{ animationDelay: "120ms" }}
      >
        <WatchlistWidget />
        <NewsWidget newsResult={newsResult} />
        <AIInsightWidget />
      </div>
    </div>
  );
}
