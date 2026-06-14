"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress/ProgressContext";

interface QuizAccessGuardProps {
  lessonId: number;
  children: React.ReactNode;
}

/**
 * Reindirizza alla pagina della lezione se il quiz non è ancora accessibile
 * (`lesson_completed = false` per la lezione corrente, sez. 6-7 della spec).
 */
export function QuizAccessGuard({ lessonId, children }: QuizAccessGuardProps) {
  const router = useRouter();
  const { isLoaded, isQuizUnlocked } = useProgress();
  const unlocked = isQuizUnlocked(lessonId);

  useEffect(() => {
    if (!isLoaded || unlocked) return;
    router.replace(`/lessons/${lessonId}`);
  }, [isLoaded, unlocked, lessonId, router]);

  if (!isLoaded || !unlocked) return null;

  return <>{children}</>;
}
