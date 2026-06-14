import Link from "next/link";

interface LessonLinkProps {
  lessonId: number;
  title: string;
}

/** Card "Lezione collegata" con tasto "Rivedi" (sez. 4 spec). */
export function LessonLink({ lessonId, title }: LessonLinkProps) {
  return (
    <div className="flex items-center justify-between rounded-card border border-bg-sidebar bg-bg-card p-5">
      <div>
        <div className="text-xs text-text-secondary">Lezione collegata</div>
        <div className="text-base font-bold text-text-primary">{title}</div>
      </div>
      <Link
        href={`/lessons/${lessonId}`}
        className="flex h-touch-target items-center rounded-card bg-accent-purple px-4 text-sm font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90"
      >
        Rivedi
      </Link>
    </div>
  );
}
