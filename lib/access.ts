import type { LessonProgress, ProgressState } from "@/types/progress";
import { DEFAULT_LESSON_PROGRESS } from "@/types/progress";

export const TOTAL_LESSONS = 6;
export const LESSON_IDS = Array.from({ length: TOTAL_LESSONS }, (_, i) => i + 1);

export function getLessonProgress(
  state: ProgressState,
  lessonId: number
): LessonProgress {
  return state[lessonId] ?? DEFAULT_LESSON_PROGRESS;
}

/**
 * Lezione `n` accessibile solo se `lesson_completed = true` per la lezione
 * `n-1` (eccetto la lezione 1, sempre accessibile).
 */
export function isLessonUnlocked(state: ProgressState, lessonId: number): boolean {
  if (lessonId <= 1) return true;
  return getLessonProgress(state, lessonId - 1).lessonCompleted;
}

/** Quiz accessibile solo se `lesson_completed = true` per la lezione corrente. */
export function isQuizUnlocked(state: ProgressState, lessonId: number): boolean {
  return getLessonProgress(state, lessonId).lessonCompleted;
}

/** Workbench per una lezione accessibile solo se `quiz_passed = true` per quella lezione. */
export function isWorkbenchUnlocked(state: ProgressState, lessonId: number): boolean {
  return getLessonProgress(state, lessonId).quizPassed;
}

/**
 * Lezione su cui reindirizzare un utente che tenta di accedere a una
 * lezione bloccata: la prima lezione non ancora completata, oppure
 * l'ultima lezione se il percorso è stato completato interamente.
 */
export function getNextAccessibleLessonId(state: ProgressState): number {
  for (const id of LESSON_IDS) {
    if (!getLessonProgress(state, id).lessonCompleted) {
      return id;
    }
  }
  return LESSON_IDS[LESSON_IDS.length - 1];
}

/**
 * Percorso completato: il quiz dell'ultima lezione è stato superato
 * (implica che tutte le lezioni precedenti sono completate, sez. 6-7 spec).
 */
export function isPathCompleted(state: ProgressState): boolean {
  return getLessonProgress(state, LESSON_IDS[LESSON_IDS.length - 1]).quizPassed;
}
