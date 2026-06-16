"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LESSON_IDS } from "@/lib/access";
import { useProgress } from "@/lib/progress/ProgressContext";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { BookIcon, ChartIcon, CheckIcon, LockIcon } from "@/components/layout/icons";

function navLinkClasses(active: boolean): string {
  return `flex items-center justify-between gap-2 rounded-card px-2.5 py-1.5 text-xs transition duration-150 ease-in-out ${
    active
      ? "bg-accent-purple/15 font-bold text-text-primary"
      : "text-text-secondary hover:translate-x-0.5 hover:bg-bg-card hover:text-text-primary"
  }`;
}

function activeLessonIdFromPath(pathname: string): number | undefined {
  const match = pathname.match(/^\/lessons\/(\d+)/);
  return match ? Number(match[1]) : undefined;
}

/** Sidebar contestuale del modulo Learn: progresso percorso, elenco lezioni e accesso al Workbench collegato. */
export function LearnSidebar() {
  const pathname = usePathname() ?? "";
  const { getLessonProgress, isLessonUnlocked, isWorkbenchUnlocked } = useProgress();

  const completedCount = LESSON_IDS.filter((id) => getLessonProgress(id).lessonCompleted).length;
  const progress = (completedCount / LESSON_IDS.length) * 100;

  const lessonId = activeLessonIdFromPath(pathname) ?? LESSON_IDS[0];
  const workbenchUnlocked = isWorkbenchUnlocked(lessonId);

  return (
    <aside className="hidden w-sidebar shrink-0 flex-col gap-5 border-r border-bg-card/60 bg-bg-sidebar p-5 md:flex">
      <div>
        <div className="flex items-center justify-between text-[11px] text-text-secondary">
          <span className="font-bold uppercase tracking-wide">Percorso Learn</span>
          <span className="font-mono">
            {completedCount}/{LESSON_IDS.length}
          </span>
        </div>
        <div className="mt-2 overflow-hidden rounded-full">
          <ProgressBar progress={progress} />
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {LESSON_IDS.map((id) => {
          const unlocked = isLessonUnlocked(id);
          const completed = getLessonProgress(id).lessonCompleted;
          const active = pathname === `/lessons/${id}` || pathname === `/lessons/${id}/quiz`;

          if (!unlocked) {
            return (
              <span
                key={id}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center justify-between rounded-card px-2.5 py-1.5 text-xs text-text-secondary opacity-40"
              >
                <span className="flex items-center gap-2">
                  <BookIcon className="h-4 w-4" />
                  Lezione {id}
                </span>
                <LockIcon className="h-3.5 w-3.5" />
              </span>
            );
          }

          return (
            <Link key={id} href={`/lessons/${id}`} className={navLinkClasses(active)}>
              <span className="flex items-center gap-2">
                <BookIcon className="h-4 w-4" />
                Lezione {id}
              </span>
              {completed && <CheckIcon className="h-3.5 w-3.5 text-accent-green" />}
            </Link>
          );
        })}
      </nav>

      {workbenchUnlocked ? (
        <Link
          href={`/workbench?lesson=${lessonId}`}
          className="flex items-center justify-between rounded-card border border-bg-card/60 px-2.5 py-2 text-xs text-text-secondary transition duration-150 ease-in-out hover:border-accent-purple/40 hover:text-text-primary"
        >
          <span className="flex items-center gap-2">
            <ChartIcon className="h-4 w-4" />
            Workbench
          </span>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="flex cursor-not-allowed items-center justify-between rounded-card border border-bg-card/60 px-2.5 py-2 text-xs text-text-secondary opacity-40"
        >
          <span className="flex items-center gap-2">
            <ChartIcon className="h-4 w-4" />
            Workbench
          </span>
          <LockIcon className="h-3.5 w-3.5" />
        </span>
      )}
    </aside>
  );
}
