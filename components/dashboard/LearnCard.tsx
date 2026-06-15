"use client";

import type { LessonMeta } from "@/types";
import { LESSON_IDS, getNextAccessibleLessonId, isPathCompleted } from "@/lib/access";
import { useProgress } from "@/lib/progress/ProgressContext";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { BookIcon, TrophyIcon } from "@/components/layout/icons";

interface LearnCardProps {
  lessonMeta: LessonMeta[];
}

/** Card del modulo Learn nel command center della Home: progresso reale + CTA "Continua"/"Esplora il grafico". */
export function LearnCard({ lessonMeta }: LearnCardProps) {
  const { state, getLessonProgress } = useProgress();

  const pathCompleted = isPathCompleted(state);
  const nextLessonId = getNextAccessibleLessonId(state);
  const nextLesson = lessonMeta.find((lesson) => lesson.id === nextLessonId);
  const completedCount = LESSON_IDS.filter((id) => getLessonProgress(id).lessonCompleted).length;
  const progress = (completedCount / LESSON_IDS.length) * 100;

  const progressDetail = (
    <div className="mt-3">
      <ProgressBar progress={progress} />
      <p className="mt-1.5 font-mono text-xs text-text-secondary">
        {completedCount}/{LESSON_IDS.length} lezioni
      </p>
    </div>
  );

  if (pathCompleted) {
    return (
      <ModuleCard
        icon={<TrophyIcon className="h-5 w-5" />}
        iconClassName="bg-accent-green/15 text-accent-green"
        eyebrow="Learn"
        title="Percorso completato"
        description="Hai completato tutte le 6 lezioni. Continua a esplorare i dati nel grafico."
        cta={{ label: "Esplora il grafico", href: "/workbench" }}
      >
        {progressDetail}
      </ModuleCard>
    );
  }

  if (!nextLesson) return null;

  return (
    <ModuleCard
      icon={<BookIcon className="h-4 w-4" />}
      eyebrow="Learn"
      title={`Lezione ${nextLesson.id} — ${nextLesson.title}`}
      description={nextLesson.keyConcept}
      cta={{ label: "Continua", href: `/lessons/${nextLesson.id}` }}
    >
      {progressDetail}
    </ModuleCard>
  );
}
