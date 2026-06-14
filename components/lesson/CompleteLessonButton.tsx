"use client";

import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress/ProgressContext";

interface CompleteLessonButtonProps {
  lessonId: number;
}

/**
 * Salva `lesson_completed = true` in localStorage (via ProgressContext)
 * e reindirizza al quiz della lezione.
 */
export function CompleteLessonButton({ lessonId }: CompleteLessonButtonProps) {
  const router = useRouter();
  const { getLessonProgress, setLessonCompleted } = useProgress();
  const completed = getLessonProgress(lessonId).lessonCompleted;

  const handleClick = () => {
    setLessonCompleted(lessonId, true);
    router.push(`/lessons/${lessonId}/quiz`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-8 min-h-touch-target w-full rounded-card bg-accent-purple px-6 py-3 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 md:w-auto"
    >
      {completed ? "Vai al quiz" : "Ho completato la lezione"}
    </button>
  );
}
