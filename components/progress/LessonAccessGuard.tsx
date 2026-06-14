"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNextAccessibleLessonId } from "@/lib/access";
import { useProgress } from "@/lib/progress/ProgressContext";

interface LessonAccessGuardProps {
  lessonId: number;
  children: React.ReactNode;
}

/**
 * Reindirizza alla prossima lezione accessibile se l'utente tenta di
 * apertura una lezione bloccata (regola sez. 6-7 della spec).
 */
export function LessonAccessGuard({ lessonId, children }: LessonAccessGuardProps) {
  const router = useRouter();
  const { state, isLoaded, isLessonUnlocked } = useProgress();
  const unlocked = isLessonUnlocked(lessonId);

  useEffect(() => {
    if (!isLoaded || unlocked) return;
    router.replace(`/lessons/${getNextAccessibleLessonId(state)}`);
  }, [isLoaded, unlocked, state, router]);

  if (!isLoaded || !unlocked) return null;

  return <>{children}</>;
}
