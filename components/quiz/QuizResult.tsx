import Link from "next/link";

interface QuizResultProps {
  lessonId: number;
  score: number;
  total: number;
  passThreshold: number;
  passed: boolean;
  attempts: number;
  retryLockedSeconds: number;
  onRetry: () => void;
}

/** Schermata finale del quiz: punteggio e CTA in base al risultato. */
export function QuizResult({
  lessonId,
  score,
  total,
  passThreshold,
  passed,
  attempts,
  retryLockedSeconds,
  onRetry,
}: QuizResultProps) {
  const retryLocked = retryLockedSeconds > 0;

  return (
    <div className="rounded-card border border-text-secondary/10 bg-bg-card p-6 text-center">
      <p className="text-xs font-bold uppercase tracking-wide text-accent-purple">
        Risultato quiz
      </p>
      <p className="mt-2 font-mono text-4xl font-bold text-text-primary">
        {score}/{total}
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        Soglia per superare il quiz: {passThreshold}/{total} risposte corrette
      </p>

      {passed ? (
        <>
          <p className="mt-4 text-base text-accent-green">
            Quiz superato! Hai sbloccato il grafico interattivo collegato a questa lezione.
          </p>
          <Link
            href={`/workbench?lesson=${lessonId}`}
            className="mt-6 inline-flex min-h-touch-target w-full items-center justify-center rounded-card bg-accent-green px-6 py-3 text-base font-bold text-bg-primary transition duration-150 ease-in-out hover:opacity-90 md:w-auto"
          >
            Sblocca il grafico
          </Link>
        </>
      ) : (
        <>
          <p className="mt-4 text-base text-error">
            Quiz non superato. Ti servono almeno {passThreshold}/{total} risposte corrette per
            sbloccare il grafico.
          </p>
          {attempts >= 2 && (
            <p className="mt-2 text-sm text-text-secondary">Rileggi la lezione con calma.</p>
          )}
          <button
            type="button"
            onClick={onRetry}
            disabled={retryLocked}
            className="mt-6 min-h-touch-target w-full rounded-card bg-accent-purple px-6 py-3 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
          >
            {retryLocked ? `Riprova (disponibile in ${retryLockedSeconds}s)` : "Riprova"}
          </button>
        </>
      )}
    </div>
  );
}
