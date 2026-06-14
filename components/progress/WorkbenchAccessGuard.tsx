"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress/ProgressContext";

interface WorkbenchAccessGuardProps {
  lessonId: number;
  children: React.ReactNode;
}

/**
 * Reindirizza al quiz della lezione se il workbench per quella lezione non è
 * ancora accessibile (`quiz_passed = false`, sez. 6-7 spec).
 */
export function WorkbenchAccessGuard({ lessonId, children }: WorkbenchAccessGuardProps) {
  const router = useRouter();
  const { isLoaded, isWorkbenchUnlocked } = useProgress();
  const unlocked = isWorkbenchUnlocked(lessonId);

  useEffect(() => {
    if (!isLoaded || unlocked) return;
    router.replace(`/lessons/${lessonId}/quiz`);
  }, [isLoaded, unlocked, lessonId, router]);

  if (!isLoaded || !unlocked) return null;

  return <>{children}</>;
}
