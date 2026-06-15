"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { LessonProgress, ProgressState } from "@/types/progress";
import { DEFAULT_LESSON_PROGRESS } from "@/types/progress";
import {
  getLessonProgress as getLessonProgressFromState,
  isLessonUnlocked as checkLessonUnlocked,
  isQuizUnlocked as checkQuizUnlocked,
  isWorkbenchUnlocked as checkWorkbenchUnlocked,
} from "@/lib/access";
import {
  LESSON_PROGRESS_STORAGE_KEY,
  LocalStorageProgressStore,
} from "@/lib/progress/localStorageProgressStore";
import { SupabaseProgressStore } from "@/lib/progress/supabaseProgressStore";
import { createClient } from "@/lib/supabase/client";

interface ProgressContextValue {
  state: ProgressState;
  /** true dopo il primo caricamento dei progressi (localStorage o Supabase). */
  isLoaded: boolean;
  /** messaggio dell'ultimo errore di caricamento/salvataggio su Supabase, se presente. */
  error: string | null;
  getLessonProgress: (lessonId: number) => LessonProgress;
  setLessonCompleted: (lessonId: number, completed: boolean) => void;
  setQuizPassed: (lessonId: number, passed: boolean) => void;
  incrementQuizAttempts: (lessonId: number) => void;
  isLessonUnlocked: (lessonId: number) => boolean;
  isQuizUnlocked: (lessonId: number) => boolean;
  isWorkbenchUnlocked: (lessonId: number) => boolean;
  /** Elimina tutti i progressi dell'utente (locali o su Supabase). */
  resetProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

const localStore = new LocalStorageProgressStore();

function migrationKeyFor(userId: string): string {
  return `finlearn:progressMigrated:${userId}`;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store Supabase per l'utente autenticato corrente, o null se non loggato
  // (in tal caso si ricade su localStorage, comportamento beta).
  const remoteStoreRef = useRef<SupabaseProgressStore | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadForUser(userId: string | null) {
      setIsLoaded(false);
      setError(null);

      if (!userId) {
        remoteStoreRef.current = null;
        if (!isMounted) return;
        setState(localStore.getState());
        setIsLoaded(true);
        return;
      }

      const store = new SupabaseProgressStore(supabase, userId);
      remoteStoreRef.current = store;

      try {
        const migrationKey = migrationKeyFor(userId);
        const alreadyMigrated = window.localStorage.getItem(migrationKey) === "true";

        if (!alreadyMigrated) {
          const localState = localStore.getState();
          if (Object.keys(localState).length > 0) {
            await store.migrateFromLocalState(localState);
            window.localStorage.removeItem(LESSON_PROGRESS_STORAGE_KEY);
          }
          window.localStorage.setItem(migrationKey, "true");
        }

        const remoteState = await store.fetchState();
        if (!isMounted) return;
        setState(remoteState);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err.message : "Errore nel caricamento dei progressi."
        );
        // fallback: stato locale, per non bloccare la navigazione
        setState(localStore.getState());
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      // TOKEN_REFRESHED/USER_UPDATED non cambiano i progressi: evita ricariche superflue.
      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") return;
      loadForUser(session?.user?.id ?? null);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const setLessonCompleted = useCallback((lessonId: number, completed: boolean) => {
    const store = remoteStoreRef.current;

    if (!store) {
      localStore.setLessonCompleted(lessonId, completed);
      setState(localStore.getState());
      return;
    }

    setState((prev) => {
      const next: LessonProgress = {
        ...DEFAULT_LESSON_PROGRESS,
        ...prev[lessonId],
        lessonCompleted: completed,
      };
      store.upsertLessonProgress(lessonId, next).catch((err) => {
        setError(err instanceof Error ? err.message : "Errore nel salvataggio dei progressi.");
      });
      return { ...prev, [lessonId]: next };
    });
  }, []);

  const setQuizPassed = useCallback((lessonId: number, passed: boolean) => {
    const store = remoteStoreRef.current;

    if (!store) {
      localStore.setQuizPassed(lessonId, passed);
      setState(localStore.getState());
      return;
    }

    setState((prev) => {
      const next: LessonProgress = {
        ...DEFAULT_LESSON_PROGRESS,
        ...prev[lessonId],
        quizPassed: passed,
      };
      store.upsertLessonProgress(lessonId, next).catch((err) => {
        setError(err instanceof Error ? err.message : "Errore nel salvataggio dei progressi.");
      });
      return { ...prev, [lessonId]: next };
    });
  }, []);

  const incrementQuizAttempts = useCallback((lessonId: number) => {
    const store = remoteStoreRef.current;

    if (!store) {
      localStore.incrementQuizAttempts(lessonId);
      setState(localStore.getState());
      return;
    }

    setState((prev) => {
      const current = prev[lessonId] ?? DEFAULT_LESSON_PROGRESS;
      const next: LessonProgress = {
        ...current,
        quizAttempts: current.quizAttempts + 1,
      };
      store.upsertLessonProgress(lessonId, next).catch((err) => {
        setError(err instanceof Error ? err.message : "Errore nel salvataggio dei progressi.");
      });
      return { ...prev, [lessonId]: next };
    });
  }, []);

  const resetProgress = useCallback(async () => {
    const store = remoteStoreRef.current;

    if (!store) {
      window.localStorage.removeItem(LESSON_PROGRESS_STORAGE_KEY);
      setState({});
      return;
    }

    try {
      await store.resetProgress();
      setState({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il reset dei progressi.");
      throw err;
    }
  }, []);

  const value: ProgressContextValue = {
    state,
    isLoaded,
    error,
    getLessonProgress: (lessonId) => getLessonProgressFromState(state, lessonId),
    setLessonCompleted,
    setQuizPassed,
    incrementQuizAttempts,
    isLessonUnlocked: (lessonId) => checkLessonUnlocked(state, lessonId),
    isQuizUnlocked: (lessonId) => checkQuizUnlocked(state, lessonId),
    isWorkbenchUnlocked: (lessonId) => checkWorkbenchUnlocked(state, lessonId),
    resetProgress,
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
