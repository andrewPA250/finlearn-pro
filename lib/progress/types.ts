import type { LessonProgress, ProgressState } from "@/types/progress";

/**
 * Astrazione sulla persistenza dei progressi utente.
 * La beta implementa questa interfaccia su localStorage; al lancio
 * pubblico potrà essere sostituita da un'implementazione su Supabase
 * senza modificare i componenti che la consumano.
 */
export interface ProgressStore {
  getState(): ProgressState;
  getLessonProgress(lessonId: number): LessonProgress;
  setLessonCompleted(lessonId: number, completed: boolean): void;
  setQuizPassed(lessonId: number, passed: boolean): void;
  incrementQuizAttempts(lessonId: number): void;
  isLessonUnlocked(lessonId: number): boolean;
  isQuizUnlocked(lessonId: number): boolean;
  isWorkbenchUnlocked(lessonId: number): boolean;
}
