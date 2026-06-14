"use client";

import Link from "next/link";
import { LESSON_IDS, getNextAccessibleLessonId, isPathCompleted } from "@/lib/access";
import { useProgress } from "@/lib/progress/ProgressContext";

type CircleState = "completed" | "active" | "locked";

const CIRCLE_STYLES: Record<CircleState, string> = {
  completed: "border-accent-green bg-accent-green/20 text-accent-green",
  active: "border-accent-purple bg-accent-purple/20 text-accent-purple",
  locked: "border-bg-sidebar bg-bg-primary text-text-secondary opacity-40",
};

/** 6 cerchi connessi: completato / attivo / bloccato (sez. 4 spec). */
export function LessonTracker() {
  const { state, getLessonProgress, isLessonUnlocked } = useProgress();

  const nextLessonId = getNextAccessibleLessonId(state);
  const pathCompleted = isPathCompleted(state);

  return (
    <div className="rounded-card border border-bg-sidebar bg-bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">Percorso</p>
        <p className="text-xs font-mono text-text-secondary">
          {pathCompleted ? "Completato" : `Lezione ${nextLessonId}`}
        </p>
      </div>
      <div className="mt-4 flex items-center">
        {LESSON_IDS.map((id, index) => {
          const completed = getLessonProgress(id).lessonCompleted;
          const unlocked = isLessonUnlocked(id);
          const active = !pathCompleted && id === nextLessonId;

          let circleState: CircleState = "locked";
          if (completed) circleState = "completed";
          else if (active) circleState = "active";

          const circle = (
            <div className="relative flex h-8 w-8 items-center justify-center sm:h-10 sm:w-10">
              {active && (
                <span className="absolute inset-0 animate-ping rounded-full bg-accent-purple/30" aria-hidden="true" />
              )}
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition duration-150 ease-in-out sm:h-10 sm:w-10 sm:text-sm ${CIRCLE_STYLES[circleState]} ${unlocked ? "hover:scale-110" : ""}`}
              >
                {completed ? "✓" : id}
              </div>
            </div>
          );

          return (
            <div key={id} className="flex flex-1 items-center">
              {unlocked ? (
                <Link href={`/lessons/${id}`} aria-label={`Lezione ${id}`}>
                  {circle}
                </Link>
              ) : (
                <span aria-disabled="true" aria-label={`Lezione ${id} bloccata`}>
                  {circle}
                </span>
              )}
              {index < LESSON_IDS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 transition duration-150 ease-in-out ${completed ? "bg-accent-green/40" : "bg-bg-sidebar"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
