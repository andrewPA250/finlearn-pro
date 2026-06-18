"use client";

import Link from "next/link";
import type { TickerQuote } from "@/lib/market/ticker";
import type { NewsItem } from "@/lib/assetNews";
import type { LessonMeta } from "@/types";
import { FeaturedMarketsTabs } from "@/components/home/FeaturedMarketsTabs";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";
import { getCatalogStats } from "@/lib/markets/catalog";

interface HomePageContentProps {
  quotes: Record<string, TickerQuote | null>;
  catalogStats: ReturnType<typeof getCatalogStats>;
  lessons: LessonMeta[];
  topNews: NewsItem[];
}

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

function formatAge(unixSeconds: number, lang: string): string {
  if (!unixSeconds || unixSeconds <= 0) return "";
  const diffMs = Date.now() - unixSeconds * 1000;
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return lang === "it" ? "< 1h fa" : "< 1h ago";
  if (diffH < 24) return lang === "it" ? `${diffH}h fa` : `${diffH}h ago`;
  return lang === "it" ? `${Math.floor(diffH / 24)}g fa` : `${Math.floor(diffH / 24)}d ago`;
}

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

export function HomePageContent({
  quotes,
  catalogStats,
  lessons,
  topNews,
}: HomePageContentProps) {
  const { language } = useSettings();
  const lang = language;

  const heroQuotes: { symbol: string; label: string }[] = [
    { symbol: "AAPL",   label: "Apple" },
    { symbol: "NVDA",   label: "NVIDIA" },
    { symbol: "BTCUSD", label: "Bitcoin" },
    { symbol: "XAUUSD", label: "Gold" },
    { symbol: "US10Y",  label: lang === "it" ? "Tesoreria 10Y" : "10Y Treasury" },
  ];

  const keyMarkets: { symbol: string; label: string }[] = [
    { symbol: "SPX",    label: "S&P 500" },
    { symbol: "NDX",    label: "Nasdaq 100" },
    { symbol: "BTCUSD", label: "Bitcoin" },
    { symbol: "XAUUSD", label: "Gold" },
    { symbol: "EURUSD", label: "EUR / USD" },
    { symbol: "US10Y",  label: lang === "it" ? "Tesoreria 10Y" : "10Y Treasury" },
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
                {t("realMarketData", lang)} · {catalogStats.total}+ {lang === "it" ? "Asset" : "Assets"}
              </div>

              <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-text-primary md:text-5xl">
                {t("exploreMarketsHero", lang)}<br />
                <span className="text-cyan">{t("analyzeSmarter", lang)}</span><br />
                {t("investWithConfidence", lang)}
              </h1>

              <p className="mb-8 max-w-md text-base leading-relaxed text-text-secondary">
                {t("heroCopy", lang)}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/markets"
                  className="inline-flex items-center gap-2 rounded-card bg-cyan px-5 py-2.5 text-sm font-semibold text-bg-primary transition duration-150 hover:bg-cyan-dark"
                >
                  {t("marketHeatmap", lang)} →
                </Link>
                <Link
                  href="/workbench"
                  className="inline-flex items-center gap-2 rounded-card border border-bg-border bg-bg-card px-5 py-2.5 text-sm font-medium text-text-secondary transition duration-150 hover:border-cyan/30 hover:text-text-primary"
                >
                  {lang === "it" ? "Apri Workbench" : "Open Workbench"}
                </Link>
              </div>

              {/* Quick stats */}
              <div className="mt-10 flex gap-8">
                <div>
                  <p className="text-2xl font-extrabold font-mono text-text-primary">{catalogStats.total}+</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{t("assetsTracked", lang)}</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-mono text-text-primary">{Object.keys(catalogStats.byCategory).length}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{t("assetClassesCount", lang)}</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-mono text-cyan">{lang === "it" ? "Dal Vivo" : "Live"}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{t("marketDataLive", lang)}</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-mono text-text-primary">{lang === "it" ? "Gratuito" : "Free"}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{t("noSignupNeeded", lang)}</p>
                </div>
              </div>
            </div>

            {/* Right — live market snapshot */}
            <div className="rounded-card border border-bg-border bg-bg-card">
              <div className="flex items-center justify-between border-b border-bg-border px-4 py-3">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{t("marketSnapshot", lang)}</p>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-positive">
                  <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                  {lang === "it" ? "Dal Vivo" : "Live"}
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
                  {t("viewAllMarkets", lang)} →
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
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{t("keyMarketsToday", lang)}</h2>
            <Link href="/markets" className="text-xs text-cyan hover:text-cyan-light transition-colors">
              {t("viewAll", lang)} →
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
            <h2 className="text-lg font-bold text-text-primary mb-1">{t("powerfulTools", lang)}</h2>
            <p className="text-sm text-text-muted">{t("toolsDesc", lang)}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">

            <Link href="/markets">
              <div className="group rounded-card border border-bg-border bg-bg-card p-5 transition-all duration-150 hover:border-cyan/30 hover:bg-bg-hover cursor-pointer h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-card bg-cyan-bg/40 text-xl">
                  📊
                </div>
                <p className="mb-2 text-sm font-semibold text-text-primary">{t("marketsModule", lang)}</p>
                <p className="text-xs leading-relaxed text-text-muted">
                  {t("marketsDesc2", lang).replace("{count}", String(catalogStats.total))}
                </p>
                <p className="mt-3 text-xs text-cyan">{lang === "it" ? "Esplora" : "Explore"} →</p>
              </div>
            </Link>

            <Link href="/lessons/1">
              <div className="group rounded-card border border-bg-border bg-bg-card p-5 transition-all duration-150 hover:border-cyan/30 hover:bg-bg-hover cursor-pointer h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-card bg-cyan-bg/40 text-xl">
                  📚
                </div>
                <p className="mb-2 text-sm font-semibold text-text-primary">{lang === "it" ? "Impara" : "Learn"}</p>
                <p className="text-xs leading-relaxed text-text-muted">
                  {t("learnDesc", lang)}
                </p>
                <p className="mt-3 text-xs text-cyan">{t("startLearning", lang)} →</p>
              </div>
            </Link>

            <Link href="/workbench">
              <div className="group rounded-card border border-bg-border bg-bg-card p-5 transition-all duration-150 hover:border-cyan/30 hover:bg-bg-hover cursor-pointer h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-card bg-cyan-bg/40 text-xl">
                  🧪
                </div>
                <p className="mb-2 text-sm font-semibold text-text-primary">{lang === "it" ? "Quant Lab" : "Quant Lab"}</p>
                <p className="text-xs leading-relaxed text-text-muted">
                  {t("quantLabDesc", lang)}
                </p>
                <p className="mt-3 text-xs text-cyan">{t("openWorkbench2", lang)} →</p>
              </div>
            </Link>

            <div className="rounded-card border border-bg-border bg-bg-card p-5 opacity-60 h-full">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-card bg-bg-hover text-xl">
                ✦
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-semibold text-text-primary">{t("aiAnalyst", lang)}</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-caution/20 text-caution border border-caution/30">{t("soon", lang)}</span>
              </div>
              <p className="text-xs leading-relaxed text-text-muted">
                {t("aiAnalystDesc", lang)}
              </p>
              <p className="mt-3 text-xs text-text-disabled">{t("comingSoon", lang)}</p>
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
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{t("featuredMarkets", lang)}</h2>
            <Link href="/markets" className="text-xs text-cyan hover:text-cyan-light transition-colors">
              {t("viewAll", lang)} →
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
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{t("latestMarketNews", lang)}</h2>
              <Link href="/news" className="text-xs text-cyan hover:text-cyan-light transition-colors">
                {t("viewAllNews", lang)} →
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
                    {formatAge(item.datetime, lang)}
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
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{t("startLearningSection", lang)}</h2>
            <Link href="/lessons/1" className="text-xs text-cyan hover:text-cyan-light transition-colors">
              {t("goToLearn", lang)} →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            {/* Featured lesson card — larger */}
            <div className="md:col-span-2 rounded-card border border-cyan/20 bg-cyan-bg/10 p-6">
              <p className="text-xs font-bold text-cyan uppercase tracking-wide mb-2">{t("structuredLearning", lang)}</p>
              <h3 className="text-lg font-bold text-text-primary mb-2">{t("buildFinancialFoundation", lang)}</h3>
              <p className="text-sm text-text-muted leading-relaxed mb-5">
                {t("buildFoundationDesc", lang)}
              </p>
              <Link
                href="/lessons/1"
                className="inline-flex items-center gap-2 rounded-card bg-cyan px-4 py-2 text-sm font-semibold text-bg-primary transition duration-150 hover:bg-cyan-dark"
              >
                {t("startLesson1", lang)} →
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
        <div className="mx-auto max-w-platform px-6 py-6 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-text-disabled">
              © 2026 FinanceHub — {t("footerCopy", lang)}
            </p>
            <div className="flex gap-4 text-[11px] text-text-disabled">
              <Link href="/markets" className="hover:text-text-secondary transition-colors">{lang === "it" ? "Mercati" : "Markets"}</Link>
              <Link href="/workbench" className="hover:text-text-secondary transition-colors">{lang === "it" ? "Workbench" : "Workbench"}</Link>
              <Link href="/lessons/1" className="hover:text-text-secondary transition-colors">{lang === "it" ? "Impara" : "Learn"}</Link>
              <Link href="/settings" className="hover:text-text-secondary transition-colors">{lang === "it" ? "Impostazioni" : "Settings"}</Link>
            </div>
          </div>
          <p className="text-[10px] text-text-disabled/60 leading-relaxed">
            {t("footerDisclaimer", lang)}
          </p>
        </div>
      </footer>

    </div>
  );
}
