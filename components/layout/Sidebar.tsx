"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LESSON_IDS } from "@/lib/access";
import { useProgress } from "@/lib/progress/ProgressContext";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { BookIcon, ChartIcon, CheckIcon, DashboardIcon, LockIcon, LogoMark, UserIcon } from "@/components/layout/icons";

function navLinkClasses(active: boolean): string {
  return `flex items-center gap-2.5 rounded-card px-3 py-2 transition duration-150 ease-in-out ${
    active
      ? "bg-accent-purple/15 font-bold text-text-primary"
      : "text-text-secondary hover:translate-x-0.5 hover:bg-bg-card hover:text-text-primary"
  }`;
}

export function Sidebar() {
  const pathname = usePathname();
  const { getLessonProgress, isLessonUnlocked } = useProgress();

  const completedCount = LESSON_IDS.filter((id) => getLessonProgress(id).lessonCompleted).length;
  const progress = (completedCount / LESSON_IDS.length) * 100;

  return (
    <aside className="hidden w-sidebar shrink-0 flex-col gap-8 border-r border-bg-card/60 bg-bg-sidebar p-6 md:flex">
      <Link href="/" className="flex items-center gap-2.5">
        <LogoMark className="h-9 w-9" />
        <span className="flex flex-col leading-tight">
          <span className="text-base font-bold text-text-primary">
            Fin<span className="text-accent-purple">Learn</span>
          </span>
          <span className="text-xs text-text-secondary">Investire, capito.</span>
        </span>
      </Link>

      <div>
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="font-bold uppercase tracking-wide">Percorso</span>
          <span className="font-mono">
            {completedCount}/{LESSON_IDS.length}
          </span>
        </div>
        <div className="mt-2 overflow-hidden rounded-full">
          <ProgressBar progress={progress} />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 text-xs">
        <Link href="/dashboard" className={navLinkClasses(pathname === "/dashboard")}>
          <DashboardIcon className="h-4 w-4" />
          Dashboard
        </Link>

        <p className="mb-1 mt-5 px-3 text-[11px] font-bold uppercase tracking-wide text-text-secondary/60">
          Lezioni
        </p>
        {LESSON_IDS.map((id) => {
          const unlocked = isLessonUnlocked(id);
          const completed = getLessonProgress(id).lessonCompleted;
          const active = pathname === `/lessons/${id}` || pathname === `/lessons/${id}/quiz`;

          if (!unlocked) {
            return (
              <span
                key={id}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center justify-between rounded-card px-3 py-2 text-text-secondary opacity-40"
              >
                <span className="flex items-center gap-2.5">
                  <BookIcon className="h-4 w-4" />
                  Lezione {id}
                </span>
                <LockIcon className="h-3.5 w-3.5" />
              </span>
            );
          }

          return (
            <Link key={id} href={`/lessons/${id}`} className={`${navLinkClasses(active)} justify-between`}>
              <span className="flex items-center gap-2.5">
                <BookIcon className="h-4 w-4" />
                Lezione {id}
              </span>
              {completed && <CheckIcon className="h-3.5 w-3.5 text-accent-green" />}
            </Link>
          );
        })}

        <p className="mb-1 mt-5 px-3 text-[11px] font-bold uppercase tracking-wide text-text-secondary/60">
          Strumenti
        </p>
        <Link href="/workbench" className={navLinkClasses(pathname === "/workbench")}>
          <ChartIcon className="h-4 w-4" />
          Grafico
        </Link>

        <p className="mb-1 mt-5 px-3 text-[11px] font-bold uppercase tracking-wide text-text-secondary/60">
          Account
        </p>
        <Link href="/profile" className={navLinkClasses(pathname === "/profile")}>
          <UserIcon className="h-4 w-4" />
          Profilo
        </Link>
      </nav>
    </aside>
  );
}
