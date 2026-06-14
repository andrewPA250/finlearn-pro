import Link from "next/link";
import type { LessonMeta } from "@/types";
import { ArrowRightIcon, BookIcon } from "@/components/layout/icons";

interface ContinueCardProps {
  lesson: LessonMeta;
}

/** Card "Continua da dove eri" con titolo lezione e CTA (sez. 4 spec). */
export function ContinueCard({ lesson }: ContinueCardProps) {
  return (
    <div className="rounded-card border border-accent-purple/40 bg-bg-card p-5 transition duration-150 ease-in-out hover:-translate-y-0.5 hover:border-accent-purple/70">
      <div className="flex h-9 w-9 items-center justify-center rounded-card bg-accent-purple/15 text-accent-purple">
        <BookIcon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-accent-purple">
        Continua da dove eri
      </p>
      <p className="mt-2 text-lg font-bold text-text-primary">
        Lezione {lesson.id} — {lesson.title}
      </p>
      <p className="mt-1 text-sm text-text-secondary">{lesson.keyConcept}</p>
      <Link
        href={`/lessons/${lesson.id}`}
        className="group mt-4 flex h-touch-target w-full items-center justify-center gap-2 rounded-card bg-accent-purple px-4 text-sm font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 md:w-auto"
      >
        Continua
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 ease-in-out group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
