"use client";

import Link from "next/link";
import Image from "next/image";
import type { TickerQuote } from "@/lib/market/ticker";
import type { NewsItem } from "@/lib/assetNews";
import type { LessonMeta } from "@/types";
import { FeaturedMarketsTabs } from "@/components/home/FeaturedMarketsTabs";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";
import { getCatalogStats } from "@/lib/markets/catalog";
import type { EarningsEvent } from "@/lib/calendar/types";
import {
  WatchlistPreviewCard,
  PortfolioPreviewCard,
  LearningProgressCard,
  CalendarPreviewCard,
} from "@/components/home/HomeCommandModules";

interface HomePageContentProps {
  quotes: Record<string, TickerQuote | null>;
  catalogStats: ReturnType<typeof getCatalogStats>;
  lessons: LessonMeta[];
  topNews: NewsItem[];
  upcomingEarnings: EarningsEvent[];
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

function MarketIndexCard({ symbol, label, quote }: { symbol: string; label: string; quote: TickerQuote | null }) {
  if (!quote) {
    return (
      <div className="flex flex-col rounded-lg border border-bg-border/10 bg-bg-card/60 px-3.5 py-3.5">
        <span className="text-sm font-bold font-mono text-text-disabled">{symbol}</span>
        <span className="text-xl font-bold font-mono text-text-disabled mt-1.5">—</span>
        <span className="text-xs text-text-disabled/60 mt-0.5">{label}</span>
      </div>
    );
  }
  const isPositive = quote.changePercent >= 0;
  return (
    <Link href={`/asset/${symbol}`}>
      <div className="group flex flex-col rounded-lg border border-bg-border/10 bg-bg-card/60 px-3.5 py-3.5 cursor-pointer transition-colors hover:bg-bg-hover hover:border-bg-border/20">
        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-bold font-mono text-text-secondary truncate">{symbol}</span>
          <span className={`shrink-0 text-xs font-semibold font-mono ${isPositive ? "text-positive" : "text-negative"}`}>
            {isPositive ? "▲" : "▼"}{Math.abs(quote.changePercent).toFixed(2)}%
          </span>
        </div>
        <span className="text-xl font-bold font-mono text-text-primary mt-1.5">
          {formatPrice(quote.value, quote.unit)}
        </span>
        <span className="text-xs text-text-muted mt-0.5 truncate">{label}</span>
      </div>
    </Link>
  );
}

function WatchRow({ symbol, label, quote }: { symbol: string; label: string; quote: TickerQuote | null }) {
  if (!quote) return null;
  const isPositive = quote.changePercent >= 0;
  return (
    <Link href={`/asset/${symbol}`}>
      <div className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-bg-hover">
        <div className="min-w-0">
          <p className="text-sm font-bold font-mono text-text-primary">{symbol}</p>
          <p className="text-[11px] text-text-muted truncate">{label}</p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="text-sm font-bold font-mono text-text-primary">
            {formatPrice(quote.value, quote.unit)}
          </p>
          <p className={`text-xs font-mono font-semibold ${isPositive ? "text-positive" : "text-negative"}`}>
            {formatChange(quote.changePercent)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function EditorialNewsItem({ item, lang }: { item: NewsItem; lang: string }) {
  const hasImage = item.image && item.image.trim().length > 0;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-bg-hover"
    >
      {/* Left: text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold text-cyan uppercase tracking-wide shrink-0">{item.source}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-text-disabled/60 shrink-0" />
          <span className="text-xs text-text-disabled truncate">{formatAge(item.datetime, lang)}</span>
        </div>
        <p className="mt-1 text-[15px] font-medium text-text-primary leading-snug line-clamp-2 group-hover:text-cyan transition-colors">
          {item.headline}
        </p>
      </div>

      {/* Right: thumbnail if available */}
      {hasImage && (
        <div className="shrink-0 h-12 w-12 rounded overflow-hidden bg-bg-hover">
          <Image
            src={item.image}
            alt=""
            width={48}
            height={48}
            unoptimized
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </a>
  );
}

function LessonRow({ lesson }: { lesson: LessonMeta }) {
  return (
    <Link href={`/lessons/${lesson.id}`}>
      <div className="flex items-center gap-3 rounded-md bg-bg-card/50 px-3 py-2.5 transition-colors hover:bg-bg-hover cursor-pointer">
        <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-cyan-bg/40 text-[11px] font-bold text-cyan font-mono">
          {lesson.id}
        </span>
        <p className="min-w-0 text-sm font-medium text-text-primary truncate">{lesson.title}</p>
        <span className="ml-auto shrink-0 text-[11px] text-text-disabled">→</span>
      </div>
    </Link>
  );
}

export function HomePageContent({
  quotes,
  lessons,
  topNews,
  upcomingEarnings,
}: HomePageContentProps) {
  const { language: lang } = useSettings();

  const keyMarkets: { symbol: string; label: string }[] = [
    { symbol: "SPX",    label: "S&P 500" },
    { symbol: "NDX",    label: "Nasdaq 100" },
    { symbol: "BTCUSD", label: "Bitcoin" },
    { symbol: "XAUUSD", label: "Gold" },
    { symbol: "EURUSD", label: "EUR/USD" },
    { symbol: "US10Y",  label: lang === "it" ? "Tesoreria 10Y" : "10Y Treasury" },
    { symbol: "QQQ",    label: "Nasdaq 100 ETF" },
    { symbol: "VIX",    label: "Volatility Index" },
    { symbol: "WTI",    label: "Crude Oil" },
  ];

  const watchSymbols: { symbol: string; label: string }[] = [
    { symbol: "AAPL",   label: "Apple" },
    { symbol: "NVDA",   label: "NVIDIA" },
    { symbol: "MSFT",   label: "Microsoft" },
    { symbol: "BTCUSD", label: "Bitcoin" },
    { symbol: "XAUUSD", label: "Gold" },
    { symbol: "EURUSD", label: "EUR/USD" },
    { symbol: "US10Y",  label: lang === "it" ? "Tesoreria 10Y" : "10Y Treasury" },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ═══ OPENING — editorial identity + live market snapshot ═══ */}
      <section className="bg-gradient-to-b from-cyan/[0.04] to-transparent">
        <div className="mx-auto max-w-platform px-4 md:px-6 py-7 md:py-9">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_272px] md:gap-8 lg:grid-cols-[1fr_300px]">

            {/* Left — product identity + key indices */}
            <div className="flex flex-col gap-5">

              {/* Identity */}
              <div>
                <div className="mb-3 h-0.5 w-10 rounded-full bg-cyan" />
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-text-primary md:text-3xl">
                  {lang === "it"
                    ? <>Capire i <span className="text-cyan">mercati</span>. Capire il <span className="text-cyan">rischio</span>.</>
                    : <>Understand <span className="text-cyan">Markets</span>. Understand <span className="text-cyan">Risk</span>.</>
                  }
                </h1>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                  {lang === "it" ? "Impara · Analizza · Investi" : "Learn · Analyze · Invest"}
                </p>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-text-secondary">
                  {lang === "it"
                    ? "Intelligence di mercato professionale per investitori e studenti."
                    : "Professional market intelligence for investors and students."}
                </p>
              </div>

              {/* Key indices — 3×2 grid */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                  {lang === "it" ? "Indici principali" : "Key Indices"}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {keyMarkets.map(({ symbol, label }) => (
                    <MarketIndexCard key={symbol} symbol={symbol} label={label} quote={quotes[symbol] ?? null} />
                  ))}
                </div>
              </div>

            </div>

            {/* Right — live snapshot card (desktop only) */}
            <div className="hidden md:flex flex-col">
              <div className="flex flex-1 flex-col rounded-card border border-cyan/20 bg-bg-card overflow-hidden shadow-[0_0_0_1px_rgba(0,212,184,0.04)]">
                <div className="flex items-center justify-between bg-gradient-to-r from-cyan/[0.07] to-transparent px-4 py-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">
                    {t("marketSnapshot", lang)}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-positive">
                    <span className="h-1.5 w-1.5 rounded-full bg-positive animate-pulse" />
                    {lang === "it" ? "Dal Vivo" : "Live"}
                  </span>
                </div>
                <div className="flex-1">
                  {watchSymbols.map(({ symbol, label }) => (
                    <WatchRow key={symbol} symbol={symbol} label={label} quote={quotes[symbol] ?? null} />
                  ))}
                </div>
                <div className="px-4 py-3">
                  <Link
                    href="/markets"
                    className="block w-full rounded-md bg-cyan py-2 text-center text-sm font-semibold text-bg-primary transition hover:bg-cyan-dark"
                  >
                    {t("viewAllMarkets", lang)} →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ FEATURED MARKETS ═══ */}
      <section className="pt-2">
        <div className="mx-auto max-w-platform px-4 md:px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="pl-2.5 border-l-2 border-cyan text-xs font-semibold uppercase tracking-widest text-text-secondary">
              {t("featuredMarkets", lang)}
            </span>
            <Link href="/markets" className="text-[11px] text-cyan hover:text-cyan-light transition-colors">
              {t("viewAll", lang)} →
            </Link>
          </div>
          <FeaturedMarketsTabs quotes={quotes} />
        </div>
      </section>

      {/* ═══ YOUR ACTIVITY — command center modules ═══ */}
      <section className="bg-bg-card/30">
        <div className="mx-auto max-w-platform px-4 md:px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="pl-2.5 border-l-2 border-cyan text-xs font-semibold uppercase tracking-widest text-text-secondary">
              {lang === "it" ? "La Tua Attività" : "Your Activity"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <WatchlistPreviewCard lang={lang} />
            <PortfolioPreviewCard lang={lang} />
            <LearningProgressCard lang={lang} lessons={lessons} />
            <CalendarPreviewCard lang={lang} earnings={upcomingEarnings} />
          </div>
        </div>
      </section>

      {/* ═══ MARKET INTELLIGENCE — editorial news feed ═══ */}
      {topNews.length > 0 && (
        <section>
          <div className="mx-auto max-w-platform px-4 md:px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="pl-2.5 border-l-2 border-cyan text-xs font-semibold uppercase tracking-widest text-text-secondary">
                {lang === "it" ? "Notizie" : "Market Intelligence"}
              </span>
              <Link href="/news" className="text-[11px] text-cyan hover:text-cyan-light transition-colors">
                {t("viewAllNews", lang)} →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-card border border-bg-border/10 bg-bg-card/60 overflow-hidden">
                {topNews.slice(0, 3).map((item) => (
                  <EditorialNewsItem key={item.id} item={item} lang={lang} />
                ))}
              </div>
              <div className="hidden sm:block rounded-card border border-bg-border/10 bg-bg-card/60 overflow-hidden">
                {topNews.slice(3, 6).map((item) => (
                  <EditorialNewsItem key={item.id} item={item} lang={lang} />
                ))}
              </div>
              <div className="hidden lg:block rounded-card border border-bg-border/10 bg-bg-card/60 overflow-hidden">
                {topNews.slice(6, 9).map((item) => (
                  <EditorialNewsItem key={item.id} item={item} lang={lang} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ PLATFORM + LEARN ═══ */}
      <section className="bg-bg-card/30">
        <div className="mx-auto max-w-platform px-4 md:px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">

            {/* Platform quick access */}
            <div>
              <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-text-secondary">
                {lang === "it" ? "Piattaforma" : "Platform"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/markets">
                  <div className="flex items-center gap-2 rounded-md bg-bg-card/50 px-3 py-2.5 transition-colors hover:bg-bg-hover cursor-pointer">
                    <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-cyan-bg/30 text-cyan">
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="10" width="3.5" height="8" rx="0.5" />
                        <rect x="8.25" y="6" width="3.5" height="12" rx="0.5" />
                        <rect x="14.5" y="2" width="3.5" height="16" rx="0.5" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-text-primary">{t("marketsModule", lang)}</span>
                    <span className="ml-auto text-[11px] text-text-disabled shrink-0">→</span>
                  </div>
                </Link>
                <Link href="/lessons/1">
                  <div className="flex items-center gap-2 rounded-md bg-bg-card/50 px-3 py-2.5 transition-colors hover:bg-bg-hover cursor-pointer">
                    <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-cyan-bg/30 text-cyan">
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                        <line x1="6" y1="7.5" x2="14" y2="7.5" />
                        <line x1="6" y1="11" x2="14" y2="11" />
                        <line x1="6" y1="14.5" x2="10" y2="14.5" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-text-primary">{lang === "it" ? "Impara" : "Learn"}</span>
                    <span className="ml-auto text-[11px] text-text-disabled shrink-0">→</span>
                  </div>
                </Link>
                <Link href="/workbench">
                  <div className="flex items-center gap-2 rounded-md bg-bg-card/50 px-3 py-2.5 transition-colors hover:bg-bg-hover cursor-pointer">
                    <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-cyan-bg/30 text-cyan">
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7.5 2l-2 6h9l-2-6z" />
                        <path d="M5.5 8l-2 10h13l-2-10" />
                        <line x1="10" y1="8" x2="10" y2="18" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-text-primary">Quant Lab</span>
                    <span className="ml-auto text-[11px] text-text-disabled shrink-0">→</span>
                  </div>
                </Link>
                <Link href="/ai">
                  <div className="flex items-center gap-2 rounded-md bg-bg-card/50 px-3 py-2.5 transition-colors hover:bg-bg-hover cursor-pointer">
                    <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded bg-cyan-bg/30 text-cyan">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-text-primary">{t("aiAnalyst", lang)}</span>
                    <span className="ml-auto text-[11px] text-text-disabled shrink-0">→</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Lessons quick access */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  {t("startLearningSection", lang)}
                </span>
                <Link href="/lessons/1" className="text-[11px] text-cyan hover:text-cyan-light transition-colors">
                  {t("goToLearn", lang)} →
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {lessons.slice(0, 3).map((lesson) => (
                  <LessonRow key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-bg-base">
        <div className="mx-auto max-w-platform px-4 md:px-6 py-5 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-text-disabled">
              © 2026 FinanceHub — {t("footerCopy", lang)}
            </p>
            <div className="flex gap-4 text-[11px] text-text-disabled">
              <Link href="/markets" className="hover:text-text-secondary transition-colors">{lang === "it" ? "Mercati" : "Markets"}</Link>
              <Link href="/workbench" className="hover:text-text-secondary transition-colors">Workbench</Link>
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
