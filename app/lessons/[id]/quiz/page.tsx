import { notFound } from "next/navigation";
import { QuizAccessGuard } from "@/components/progress/QuizAccessGuard";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { getLessonMeta, getQuiz } from "@/lib/lessons";

export default function QuizPage({ params }: { params: { id: string } }) {
  const lessonId = Number(params.id);
  const meta = getLessonMeta(lessonId);

  if (!meta) {
    notFound();
  }

  const quiz = getQuiz(meta.id);

  return (
    <QuizAccessGuard lessonId={meta.id}>
      <div className="mx-auto max-w-reading p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-purple">
          Quiz — Lezione {meta.id} di 6
        </p>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">{meta.title}</h1>
        <div className="mt-6">
          <QuizRunner key={meta.id} lessonId={meta.id} quiz={quiz} />
        </div>
      </div>
    </QuizAccessGuard>
  );
}
