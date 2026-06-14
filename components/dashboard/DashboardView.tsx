"use client";

import type { LessonMeta } from "@/types";
import { LESSON_IDS, getNextAccessibleLessonId, isPathCompleted } from "@/lib/access";
import { useProgress } from "@/lib/progress/ProgressContext";
import { CompletionScreen } from "@/components/dashboard/CompletionScreen";
import { ContinueCard } from "@/components/dashboard/ContinueCard";
import { LessonTracker } from "@/components/dashboard/LessonTracker";
import { WorkbenchCard } from "@/components/dashboard/WorkbenchCard";

interface DashboardViewProps {
  lessonMeta: LessonMeta[];
}

/** Orchestratore client della dashboard: progressi reali + metadati lezione (sez. 4 spec). */
export function DashboardView({ lessonMeta }: DashboardViewProps) {
  const { state, getLessonProgress } = useProgress();

  const pathCompleted = isPathCompleted(state);
  const nextLessonId = getNextAccessibleLessonId(state);
  const nextLesson = lessonMeta.find((lesson) => lesson.id === nextLessonId);
  const completedCount = LESSON_IDS.filter((id) => getLessonProgress(id).lessonCompleted).length;

  return (
    <div className="mx-auto flex max-w-reading flex-col gap-6 p-6">
      <div className="animate-fade-in-up">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-purple">Dashboard</p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">
          {pathCompleted ? "Percorso completato 🎉" : "Bentornato"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {pathCompleted
            ? "Hai completato tutte le lezioni: continua a esplorare i dati nel grafico."
            : `Hai completato ${completedCount} di ${LESSON_IDS.length} lezioni. Continua da dove eri.`}
        </p>
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <LessonTracker />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        {pathCompleted ? <CompletionScreen /> : nextLesson && <ContinueCard lesson={nextLesson} />}
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        <WorkbenchCard />
      </div>
    </div>
  );
}
