import type { LessonProgress, ProgressState } from "@/types/progress";
import { DEFAULT_LESSON_PROGRESS } from "@/types/progress";
import type { ProgressStore } from "@/lib/progress/types";
import {
  getLessonProgress,
  isLessonUnlocked,
  isQuizUnlocked,
  isWorkbenchUnlocked,
} from "@/lib/access";

export const LESSON_PROGRESS_STORAGE_KEY = "finlearn:lessonProgress";
const STORAGE_KEY = LESSON_PROGRESS_STORAGE_KEY;

function readState(): ProgressState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressState;
  } catch {
    return {};
  }
}

function writeState(state: ProgressState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Implementazione di ProgressStore su localStorage per la beta.
 * Al lancio pubblico potrà essere sostituita da un'implementazione
 * su Supabase senza modificare i componenti che la consumano.
 */
export class LocalStorageProgressStore implements ProgressStore {
  getState(): ProgressState {
    return readState();
  }

  getLessonProgress(lessonId: number): LessonProgress {
    return getLessonProgress(readState(), lessonId);
  }

  setLessonCompleted(lessonId: number, completed: boolean): void {
    const state = readState();
    state[lessonId] = {
      ...DEFAULT_LESSON_PROGRESS,
      ...state[lessonId],
      lessonCompleted: completed,
    };
    writeState(state);
  }

  setQuizPassed(lessonId: number, passed: boolean): void {
    const state = readState();
    state[lessonId] = {
      ...DEFAULT_LESSON_PROGRESS,
      ...state[lessonId],
      quizPassed: passed,
    };
    writeState(state);
  }

  incrementQuizAttempts(lessonId: number): void {
    const state = readState();
    const current = state[lessonId] ?? DEFAULT_LESSON_PROGRESS;
    state[lessonId] = {
      ...current,
      quizAttempts: current.quizAttempts + 1,
    };
    writeState(state);
  }

  isLessonUnlocked(lessonId: number): boolean {
    return isLessonUnlocked(readState(), lessonId);
  }

  isQuizUnlocked(lessonId: number): boolean {
    return isQuizUnlocked(readState(), lessonId);
  }

  isWorkbenchUnlocked(lessonId: number): boolean {
    return isWorkbenchUnlocked(readState(), lessonId);
  }
}
