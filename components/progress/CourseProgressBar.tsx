"use client";

import { ProgressBar } from "@/components/layout/ProgressBar";
import { LESSON_IDS } from "@/lib/access";
import { useProgress } from "@/lib/progress/ProgressContext";

/**
 * ProgressBar collegata ai progressi reali: percentuale di lezioni
 * completate sul totale del percorso.
 */
export function CourseProgressBar() {
  const { state, isLoaded } = useProgress();

  const completed = LESSON_IDS.filter((id) => state[id]?.lessonCompleted).length;
  const progress = isLoaded ? (completed / LESSON_IDS.length) * 100 : 0;

  return <ProgressBar progress={progress} />;
}
