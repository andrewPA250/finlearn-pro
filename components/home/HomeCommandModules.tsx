"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWatchlist } from "@/lib/watchlist/WatchlistContext";
import { usePortfolio } from "@/lib/portfolio/PortfolioContext";
import { useProgress } from "@/lib/progress/ProgressContext";
import { getInstrumentBySymbol } from "@/lib/markets/catalog";
import type { TickerQuote } from "@/lib/market/ticker";
import { formatQuoteChange } from "@/lib/market/ticker";
import type { LessonMeta } from "@/types";
import type { EarningsEvent } from "@/lib/calendar/types";

interface ModuleShellProps {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}

function ModuleShell({ title, action, children }: ModuleShellProps) {
  return (
    <div className="flex flex-col rounded-card border border-bg-border/70 bg-bg-card px-4 py-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{title}</span>
        {action && (
          <Link href={action.href} className="text-[10px] text-cyan hover:text-cyan-light transition-colors">
            {action.label} →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyModule({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
      <p className="text-xs text-text-muted">{message}</p>
      <Link href={href} className="text-[11px] font-semibold text-cyan hover:text-cyan-light transition-colors">
        {cta} →
      </Link>
    </div>
  );
}

// ─── Watchlist Preview ────────────────────────────────────────────────────

export function WatchlistPreviewCard({ lang }: { lang: string }) {
  const { symbols } = useWatchlist();
  const [quotes, setQuotes] = useState<Record<string, TickerQuote>>({});
  const [hydrated, setHydrated] = useState(false);

  const preview = symbols.slice(0, 4);

  useEffect(() => {
    setHydrated(true);
    if (preview.length === 0) return;
    fetch(`/api/quotes?symbols=${preview.join(",")}`)
      .then((res) => (res.ok ? res.json() : {}))
      .then(setQuotes)
      .catch(() => setQuotes({}));
  }, [preview.join(",")]);

  const title = lang === "it" ? "Watchlist" : "Watchlist";

  if (!hydrated) return <ModuleShell title={title}><div className="h-16" /></ModuleShell>;

  if (symbols.length === 0) {
    return (
      <ModuleShell title={title}>
        <EmptyModule
          message={lang === "it" ? "Nessun asset in watchlist" : "Your watchlist is empty"}
          cta={lang === "it" ? "Esplora i mercati" : "Explore Markets"}
          href="/markets"
        />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title={`${title} (${symbols.length})`} action={{ label: lang === "it" ? "Vedi tutto" : "View all", href: "/watchlist" }}>
      <div className="flex flex-col gap-1.5">
        {preview.map((symbol) => {
          const inst = getInstrumentBySymbol(symbol);
          const quote = quotes[symbol];
          const isPos = quote ? quote.changePercent >= 0 : true;
          return (
            <Link key={symbol} href={`/asset/${symbol}`} className="flex items-center justify-between gap-2 rounded px-1 py-0.5 transition hover:bg-bg-hover">
              <span className="font-mono text-xs font-bold text-text-primary truncate">{inst?.symbol ?? symbol}</span>
              <span className={`font-mono text-[11px] font-semibold shrink-0 ${isPos ? "text-positive" : "text-negative"}`}>
                {quote ? formatQuoteChange(quote) : "—"}
              </span>
            </Link>
          );
        })}
      </div>
    </ModuleShell>
  );
}

// ─── Portfolio Preview ────────────────────────────────────────────────────

export function PortfolioPreviewCard({ lang }: { lang: string }) {
  const { holdings, isHydrated } = usePortfolio();
  const [quotes, setQuotes] = useState<Record<string, TickerQuote>>({});

  const symbols = holdings.map((h) => h.symbol);

  useEffect(() => {
    if (symbols.length === 0) return;
    fetch(`/api/quotes?symbols=${symbols.join(",")}`)
      .then((res) => (res.ok ? res.json() : {}))
      .then(setQuotes)
      .catch(() => setQuotes({}));
  }, [symbols.join(",")]);

  const title = lang === "it" ? "Portafoglio" : "Portfolio";

  if (!isHydrated) return <ModuleShell title={title}><div className="h-16" /></ModuleShell>;

  if (holdings.length === 0) {
    return (
      <ModuleShell title={title}>
        <EmptyModule
          message={lang === "it" ? "Nessuna posizione in portafoglio" : "Your portfolio is empty"}
          cta={lang === "it" ? "Aggiungi posizione" : "Add a Holding"}
          href="/portfolio"
        />
      </ModuleShell>
    );
  }

  let totalValue = 0;
  let totalCost = 0;
  for (const h of holdings) {
    const price = quotes[h.symbol]?.value ?? h.avgPrice;
    totalValue += price * h.quantity;
    totalCost += h.avgPrice * h.quantity;
  }
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const isPos = pnl >= 0;

  return (
    <ModuleShell title={title} action={{ label: lang === "it" ? "Vedi tutto" : "View all", href: "/portfolio" }}>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-lg font-bold text-text-primary">
          {totalValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
        </span>
        <span className={`text-xs font-semibold font-mono ${isPos ? "text-positive" : "text-negative"}`}>
          {isPos ? "+" : ""}{pnl.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} ({isPos ? "+" : ""}{pnlPct.toFixed(2)}%)
        </span>
        <span className="mt-1 text-[10px] text-text-muted">
          {holdings.length} {lang === "it" ? "posizioni" : holdings.length === 1 ? "holding" : "holdings"}
        </span>
      </div>
    </ModuleShell>
  );
}

// ─── Learning Progress ────────────────────────────────────────────────────

export function LearningProgressCard({ lang, lessons }: { lang: string; lessons: LessonMeta[] }) {
  const { state, isLoaded } = useProgress();
  const title = lang === "it" ? "Apprendimento" : "Learning Progress";

  if (!isLoaded) return <ModuleShell title={title}><div className="h-16" /></ModuleShell>;

  const completed = lessons.filter((l) => state[l.id]?.lessonCompleted).length;
  const total = lessons.length;
  const next = lessons.find((l) => !state[l.id]?.lessonCompleted) ?? lessons[0];
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (completed === 0) {
    return (
      <ModuleShell title={title}>
        <EmptyModule
          message={lang === "it" ? "Non hai ancora iniziato" : "You haven't started yet"}
          cta={lang === "it" ? "Inizia la Lezione 1" : "Start Lesson 1"}
          href="/lessons/1"
        />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title={title} action={{ label: lang === "it" ? "Continua" : "Continue", href: `/lessons/${next?.id ?? 1}` }}>
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-lg font-bold text-text-primary">{completed}/{total}</span>
          <span className="text-[10px] text-text-muted">{lang === "it" ? "lezioni completate" : "lessons completed"}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-hover">
          <div className="h-full rounded-full bg-cyan transition-all" style={{ width: `${pct}%` }} />
        </div>
        {next && (
          <span className="text-[10px] text-text-muted truncate">
            {lang === "it" ? "Prossima: " : "Next: "}{next.title}
          </span>
        )}
      </div>
    </ModuleShell>
  );
}

// ─── Calendar Preview ─────────────────────────────────────────────────────

function fmtEventDate(iso: string, lang: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(lang === "it" ? "it-IT" : "en-US", { month: "short", day: "numeric" });
}

export function CalendarPreviewCard({ lang, earnings }: { lang: string; earnings: EarningsEvent[] }) {
  const title = lang === "it" ? "Calendario" : "Calendar";

  if (earnings.length === 0) {
    return (
      <ModuleShell title={title}>
        <EmptyModule
          message={lang === "it" ? "Nessun evento questa settimana" : "No events this week"}
          cta={lang === "it" ? "Vedi calendario" : "View Calendar"}
          href="/calendar"
        />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title={title} action={{ label: lang === "it" ? "Vedi tutto" : "View all", href: "/calendar" }}>
      <div className="flex flex-col gap-1.5">
        {earnings.map((e, i) => (
          <Link key={`${e.symbol}-${i}`} href={`/asset/${e.symbol}`} className="flex items-center justify-between gap-2 rounded px-1 py-0.5 transition hover:bg-bg-hover">
            <span className="font-mono text-xs font-bold text-text-primary truncate">{e.symbol}</span>
            <span className="text-[10px] text-text-muted shrink-0">{fmtEventDate(e.date, lang)}</span>
          </Link>
        ))}
      </div>
    </ModuleShell>
  );
}
