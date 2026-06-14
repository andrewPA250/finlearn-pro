interface FeedbackBlockProps {
  text: string;
  isCorrect: boolean;
}

/** Testo di spiegazione mostrato dopo la conferma di una risposta, sempre presente. */
export function FeedbackBlock({ text, isCorrect }: FeedbackBlockProps) {
  return (
    <div
      className={`mt-4 rounded-card border bg-bg-card p-4 text-text-primary ${
        isCorrect ? "border-accent-green/40" : "border-error/40"
      }`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-wide ${
          isCorrect ? "text-accent-green" : "text-error"
        }`}
      >
        {isCorrect ? "Risposta corretta" : "Risposta non corretta"}
      </p>
      <p className="mt-2 text-sm leading-relaxed">{text}</p>
    </div>
  );
}
