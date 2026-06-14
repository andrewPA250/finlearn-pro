"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { LessonProgress, ProgressState } from "@/types/progress";
import {
  getLessonProgress as getLessonProgressFromState,
  isLessonUnlocked as checkLessonUnlocked,
  isQuizUnlocked as checkQuizUnlocked,
  isWorkbenchUnlocked as checkWorkbenchUnlocked,
} from "@/lib/access";
import { LocalStorageProgressStore } from "@/lib/progress/localStorageProgressStore";

interface ProgressContextValue {
  state: ProgressState;
  /** true dopo il primo caricamento da localStorage (lato client). */
  isLoaded: boolean;
  getLessonProgress: (lessonId: number) => LessonProgress;
  setLessonCompleted: (lessonId: number, completed: boolean) => void;
  setQuizPassed: (lessonId: number, passed: boolean) => void;
  incrementQuizAttempts: (lessonId: number) => void;
  isLessonUnlocked: (lessonId: number) => boolean;
  isQuizUnlocked: (lessonId: number) => boolean;
  isWorkbenchUnlocked: (lessonId: number) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

const store = new LocalStorageProgressStore();

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setState(store.getState());
    setIsLoaded(true);
  }, []);

  const setLessonCompleted = useCallback((lessonId: number, completed: boolean) => {
    store.setLessonCompleted(lessonId, completed);
    setState(store.getState());
  }, []);

  const setQuizPassed = useCallback((lessonId: number, passed: boolean) => {
    store.setQuizPassed(lessonId, passed);
    setState(store.getState());
  }, []);

  const incrementQuizAttempts = useCallback((lessonId: number) => {
    store.incrementQuizAttempts(lessonId);
    setState(store.getState());
  }, []);

  const value: ProgressContextValue = {
    state,
    isLoaded,
    getLessonProgress: (lessonId) => getLessonProgressFromState(state, lessonId),
    setLessonCompleted,
    setQuizPassed,
    incrementQuizAttempts,
    isLessonUnlocked: (lessonId) => checkLessonUnlocked(state, lessonId),
    isQuizUnlocked: (lessonId) => checkQuizUnlocked(state, lessonId),
    isWorkbenchUnlocked: (lessonId) => checkWorkbenchUnlocked(state, lessonId),
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress deve essere usato all'interno di un ProgressProvider");
  }
  return context;
}
