"use client";

import type { LessonMeta } from "@/types";
import type { TickerQuote } from "@/lib/market/ticker";
import { isPathCompleted } from "@/lib/access";
import { useProgress } from "@/lib/progress/ProgressContext";
import { MarketTicker } from "@/components/dashboard/MarketTicker";
import { LearnCard } from "@/components/dashboard/LearnCard";
import { WorkbenchCard } from "@/components/dashboard/WorkbenchCard";
import { PortfolioCard } from "@/components/dashboard/PortfolioCard";

interface DashboardViewProps {
  lessonMeta: LessonMeta[];
  tickerQuotes: TickerQuote[];
}

/** Home/command center di FinanceHub: ticker Markets + moduli Learn/Workbench/Portfolio (sez. 4 spec + Step 10.4). */
export function DashboardView({ lessonMeta, tickerQuotes }: DashboardViewProps) {
  const { state } = useProgress();
  const pathCompleted = isPathCompleted(state);

  return (
    <div className="mx-auto flex max-w-platform flex-col gap-6 p-6">
      <div className="animate-fade-in-up">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-purple">FinanceHub</p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">
          {pathCompleted ? "Percorso completato 🎉" : "Bentornato"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Markets, Learn e Workbench in un unico posto.</p>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <MarketTicker quotes={tickerQuotes} />
      </div>

      <div className="grid animate-fade-in-up gap-4 md:grid-cols-3" style={{ animationDelay: "120ms" }}>
        <LearnCard lessonMeta={lessonMeta} />
        <WorkbenchCard />
        <PortfolioCard />
      </div>
    </div>
  );
}
