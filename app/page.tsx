import Link from "next/link";
import { getRibbonQuotes } from "@/lib/markets/getRibbonQuotes";
import { getAssetNews } from "@/lib/assetNews";
import { LESSON_META } from "@/lib/lessonsMeta";
import { FeaturedMarketsTabs } from "@/components/home/FeaturedMarketsTabs";
import { getCatalogStats } from "@/lib/markets/catalog";
import type { TickerQuote } from "@/lib/market/ticker";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(value: number, unit?: string): string {
  if (unit === "percent") return `${value.toFixed(2)}%`;
  if (value >= 10000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 100)   return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value >= 1)     return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function formatChange(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function formatAge(unixSeconds: number): string {
  if (!unixSeconds || unixSeconds <= 0) return "";
  const diffMs = Date.now() - unixSeconds * 1000;
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return "< 1h ago";
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

// ---------------------------------------------------------------------------
// Sub-components (server-side, no state needed)
// ---------------------------------------------------------------------------

function QuoteRow({ symbol, label, quote }: { symbol: string; label: string; quote: TickerQuote | null }) {
  if (!quote) return null;
  const isPositive = quote.changePercent >= 0;

  return (
    <Link href={`/asset/${symbol}`}>
      <div className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors duration-150 hover:bg-bg-hover group">
        <div>
          <p className="text-xs font-bold text-text-primary font-mono">{symbol}</p>
          <p className="text-[10px] text-text-muted">{label}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-text-primary font-mono">
            {formatPrice(quote.value, quote.unit)}
          </p>
          <p className={`text-[10px] font-mono font-semibold ${isPositive ? "text-positive" : "text-negative"}`}>
            {formatChange(quote.changePercent)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function KeyMarketCard({ symbol, label, quote }: { symbol: string; label: string; quote: TickerQuote | null }) {
  if (!quote) {
    return (
      <div className="rounded-card border border-bg-border bg-bg-card p-4">
        <p className="text-xs font-bold text-text-muted font-mono">{symbol}</p>
        <p className="text-[10px] text-text-disabled mt-0.5">{label}</p>
        <p className="text-base font-bold text-text-disabled font-mono mt-2">—</p>
      </div>
    );
  }

  const isPositive = quote.changePercent >= 0;

  return (
    <Link href={`/asset/${symbol}`}>
      <div className="rounded-card border border-bg-border bg-bg-card p-4 transition-all duration-150 hover:border-cyan/30 hover:bg-bg-hover cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-bold text-text-muted font-mono">{symbol}</p>
            <p className="text-[10px] text-text-disabled mt-0.5">{label}</p>
          </div>
          <span className={`text-[10px] font-semibold ${isPositive ? "text-positive" : "text-negative"}`}>
            {isPositive ? "▲" : "▼"}
          </span>
        </div>
        <p className="text-lg font-bold text-text-primary font-mono">
          {formatPrice(quote.value, quote.unit)}
        </p>
        <p className={`text-xs font-mono font-semibold mt-0.5 ${isPositive ? "text-positive" : "text-negative"}`}>
          {formatChange(quote.changePercent)}
        </p>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  // Single parallel fetch — reuses ribbon cache, zero extra cost
  const [quotes, newsResult] = await Promise.all([
    getRibbonQuotes(),
    getAssetNews("SPX", undefined, "index").catch(() => ({ topNews: [], allNews: [], source: "empty" as const, status: "error" as const })),
  ]);

  const catalogStats = getCatalogStats();
  const lessons = LESSON_META.slice(0, 4);
  const topNews = newsResult.topNews.slice(0, 4);

  const heroQuotes: { symbol: string; label: string }[] = [
    { symbol: "AAPL",   label: "Apple" },
    { symbol: "NVDA",   label: "NVIDIA" },
    { symbol: "BTCUSD", label: "Bitcoin" },
    { symbol: "XAUUSD", label: "Gold" },
    { symbol: "US10Y",  label: "10Y Treasury" },
  ];

  const keyMarkets: { symbol: string; label: string }[] = [
    { symbol: "SPX",    label: "S&P 500" },
    { symbol: "NDX",    label: "Nasdaq 100" },
    { symbol: "BTCUSD", label: "Bitcoin" },
    { symbol: "XAUUSD", label: "Gold" },
    { symbol: "EURUSD", label: "EUR / USD" },
    { symbol: "US10Y",  label: "10Y Treasury" },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section className="border-b border-bg-border">
        <div className="mx-auto max-w-platform px-6 py-14 md:py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">

            {/* Left — headline + CTAs */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan-bg/30 px-3 py-1.5 text-[11px] font-semibold text-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                Real Market Data · {catalogStats.total}+ Assets
              </div>

              <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-text-primary md:text-5xl">
                Explore markets.<br />
                <span className="text-cyan">Analyze smarter.</span><br />
                Invest with confidence.
              </h1>

              <p className="mb-8 max-w-md text-base leading-relaxed text-text-secondary">
                Professional market data, advanced analytics, and structured learning — built for serious investors and market students.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/markets"
                  className="inline-flex items-center gap-2 rounded-card bg-cyan px-5 py-2.5 text-sm font-semibold text-bg-primary transition duration-150 hover:bg-cyan-dark"
                >
                  Explore Markets →
                </Link>
                <Link
                  href="/workbench"
                  className="inline-flex items-center gap-2 rounded-card border border-bg-border bg-bg-card px-5 py-2.5 text-sm font-medium text-text-secondary transition duration-150 hover:border-cyan/30 hover:text-text-primary"
                >
                  Open Workbench
                </Link>
              </div>

              {/* Quick stats */}
              <div className="mt-10 flex gap-8">
                <div>
                  <p className="text-2xl font-extrabold font-mono text-text-primary">{catalogStats.total}+</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Assets tracked</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-mono text-text-primary">{Object.keys(catalogStats.byCategory).length}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Asset classes</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-mono text-cyan">Live</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Market data</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-mono text-text-primary">Free</p>
                  <p className="text-[11px] text-text-muted mt-0.5">No sign-up needed</p>
                </div>
              </div>
            </div>

            {/* Right — live market snapshot */}
            <div className="rounded-card border border-bg-border bg-bg-card">
              <div className="flex items-center justify-between border-b border-bg-border px-4 py-3">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Market Snapshot</p>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-positive">
                  <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                  Live
                </span>
              </div>
              <div className="divide-y divide-bg-border/50">
                {heroQuotes.map(({ symbol, label }) => (
                  <QuoteRow
                    key={symbol}
                    symbol={symbol}
                    label={label}
                    quote={quotes[symbol] ?? null}
                  />
                ))}
              </div>
              <div className="border-t border-bg-border px-4 py-3">
                <Link
                  href="/markets"
                  className="block w-full rounded-card bg-cyan py-2 text-center text-sm font-semibold text-bg-primary transition duration-150 hover:bg-cyan-dark"
                >
                  View All Markets →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================
          KEY MARKETS TODAY
          ================================================================ */}
      <section className="border-b border-bg-border">
        <div className="mx-auto max-w-platform px-6 py-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Key Markets Today</h2>
            <Link href="/markets" className="text-xs text-cyan hover:text-cyan-light transition-colors">
              View all markets →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {keyMarkets.map(({ symbol, label }) => (
              <KeyMarketCard
                key={symbol}
                symbol={symbol}
                label={label}
                quote={quotes[symbol] ?? null}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          PLATFORM MODULES
          ================================================================ */}
      <section className="border-b border-bg-border bg-bg-card/30">
        <div className="mx-auto max-w-platform px-6 py-10">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-text-primary mb-1">Powerful tools for every investor</h2>
            <p className="text-sm text-text-muted">Everything from market data to structured learning — in one platform</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">

            <Link href="/markets">
              <div className="group rounded-card border border-bg-border bg-bg-card p-5 transition-all duration-150 hover:border-cyan/30 hover:bg-bg-hover cursor-pointer h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-card bg-cyan-bg/40 text-xl">
                  📊
                </div>
                <p className="mb-2 text-sm font-semibold text-text-primary">Markets</p>
                <p className="text-xs leading-relaxed text-text-muted">
                  Explore {catalogStats.total}+ assets across stocks, ETFs, crypto, forex, commodities and more.
                </p>
                <p className="mt-3 text-xs text-cyan">Explore →</p>
              </div>
            </Link>

            <Link href="/lessons/1">
              <div className="group rounded-card border border-bg-border bg-bg-card p-5 transition-all duration-150 hover:border-cyan/30 hover:bg-bg-hover cursor-pointer h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-card bg-cyan-bg/40 text-xl">
                  📚
                </div>
                <p className="mb-2 text-sm font-semibold text-text-primary">Learn</p>
                <p className="text-xs leading-relaxed text-text-muted">
                  Structured lessons on investing, risk, inflation — connected to real market data.
                </p>
                <p className="mt-3 text-xs text-cyan">Start learning →</p>
              </div>
            </Link>

            <Link href="/workbench">
              <div className="group rounded-card border border-bg-border bg-bg-card p-5 transition-all duration-150 hover:border-cyan/30 hover:bg-bg-hover cursor-pointer h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-card bg-cyan-bg/40 text-xl">
                  🧪
                </div>
                <p className="mb-2 text-sm font-semibold text-text-primary">Quant Lab</p>
                <p className="text-xs leading-relaxed text-text-muted">
                  Compare assets, analyze correlations and overlays with the interactive workbench.
                </p>
                <p className="mt-3 text-xs text-cyan">Open workbench →</p>
              </div>
            </Link>

            <div className="rounded-card border border-bg-border bg-bg-card p-5 opacity-60 h-full">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-card bg-bg-hover text-xl">
                ✦
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-semibold text-text-primary">AI Analyst</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-caution/20 text-caution border border-caution/30">SOON</span>
              </div>
              <p className="text-xs leading-relaxed text-text-muted">
                AI-powered market insights, asset summaries, and portfolio commentary.
              </p>
              <p className="mt-3 text-xs text-text-disabled">Coming soon</p>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURED MARKETS (client component — tab state)
          ================================================================ */}
      <section className="border-b border-bg-border">
        <div className="mx-auto max-w-platform px-6 py-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Featured Markets</h2>
            <Link href="/markets" className="text-xs text-cyan hover:text-cyan-light transition-colors">
              View all →
            </Link>
          </div>
          <FeaturedMarketsTabs quotes={quotes} />
        </div>
      </section>

      {/* ================================================================
          LATEST MARKET NEWS
          ================================================================ */}
      {topNews.length > 0 && (
        <section className="border-b border-bg-border bg-bg-card/20">
          <div className="mx-auto max-w-platform px-6 py-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Latest Market News</h2>
              <Link href="/markets" className="text-xs text-cyan hover:text-cyan-light transition-colors">
                View all news →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {topNews.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-card border border-bg-border bg-bg-card p-4 transition-all duration-150 hover:border-cyan/30 hover:bg-bg-hover"
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="mb-3 h-28 w-full rounded-md object-cover opacity-80"
                      loading="lazy"
                    />
                  ) : (
                    <div className="mb-3 h-28 w-full rounded-md bg-bg-hover flex items-center justify-center text-3xl">
                      📰
                    </div>
                  )}
                  <p className="text-[10px] font-bold text-cyan uppercase tracking-wide mb-1.5">
                    {item.source}
                  </p>
                  <p className="text-xs font-medium text-text-primary leading-snug line-clamp-3 group-hover:text-cyan transition-colors">
                    {item.headline}
                  </p>
                  <p className="mt-2 text-[10px] text-text-disabled">
                    {formatAge(item.datetime)}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          LEARN SECTION
          ================================================================ */}
      <section className="border-b border-bg-border">
        <div className="mx-auto max-w-platform px-6 py-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Start Learning</h2>
            <Link href="/lessons/1" className="text-xs text-cyan hover:text-cyan-light transition-colors">
              Go to Learn →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            {/* Featured lesson card — larger */}
            <div className="md:col-span-2 rounded-card border border-cyan/20 bg-cyan-bg/10 p-6">
              <p className="text-xs font-bold text-cyan uppercase tracking-wide mb-2">Structured Learning</p>
              <h3 className="text-lg font-bold text-text-primary mb-2">Build your financial foundation</h3>
              <p className="text-sm text-text-muted leading-relaxed mb-5">
                Short lessons on investing, inflation, risk, and real market examples. Connect theory to live market data.
              </p>
              <Link
                href="/lessons/1"
                className="inline-flex items-center gap-2 rounded-card bg-cyan px-4 py-2 text-sm font-semibold text-bg-primary transition duration-150 hover:bg-cyan-dark"
              >
                Start Lesson 1 →
              </Link>
            </div>

            {/* Individual lesson cards */}
            {lessons.slice(0, 3).map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <div className="rounded-card border border-bg-border bg-bg-card p-4 transition-all duration-150 hover:border-cyan/30 hover:bg-bg-hover h-full cursor-pointer">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-cyan-bg/40 text-sm font-bold text-cyan font-mono">
                    {lesson.id}
                  </div>
                  <p className="text-xs font-semibold text-text-primary mb-1 leading-snug">{lesson.title}</p>
                  <p className="text-[10px] text-text-muted leading-relaxed">{lesson.keyConcept}</p>
                </div>
              </Link>
            ))}

          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="border-t border-bg-border bg-bg-base">
        <div className="mx-auto max-w-platform px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-text-disabled">
            © 2025 FinanceHub — Real market data, professional tools, structured learning.
          </p>
          <div className="flex gap-4 text-[11px] text-text-disabled">
            <Link href="/markets" className="hover:text-text-secondary transition-colors">Markets</Link>
            <Link href="/workbench" className="hover:text-text-secondary transition-colors">Workbench</Link>
            <Link href="/lessons/1" className="hover:text-text-secondary transition-colors">Learn</Link>
            <Link href="/settings" className="hover:text-text-secondary transition-colors">Settings</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
