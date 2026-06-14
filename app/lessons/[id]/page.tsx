import { notFound } from "next/navigation";
import { CompleteLessonButton } from "@/components/lesson/CompleteLessonButton";
import { KeyConceptCallout } from "@/components/lesson/KeyConceptCallout";
import { LessonContent } from "@/components/lesson/LessonContent";
import { CourseProgressBar } from "@/components/progress/CourseProgressBar";
import { LessonAccessGuard } from "@/components/progress/LessonAccessGuard";
import { getLessonContent, getLessonMeta } from "@/lib/lessons";

export default function LessonPage({ params }: { params: { id: string } }) {
  const lessonId = Number(params.id);
  const meta = getLessonMeta(lessonId);

  if (!meta) {
    notFound();
  }

  const content = getLessonContent(meta.id);

  return (
    <LessonAccessGuard lessonId={meta.id}>
      <CourseProgressBar />
      <div className="mx-auto max-w-reading p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-purple">
          Lezione {meta.id} di 6
        </p>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">{meta.title}</h1>
        <KeyConceptCallout keyConcept={meta.keyConcept} />
        <LessonContent content={content} />
        <CompleteLessonButton lessonId={meta.id} />
      </div>
    </LessonAccessGuard>
  );
}
