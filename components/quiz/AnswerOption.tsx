export type AnswerOptionState = "default" | "selected" | "correct" | "wrong";

interface AnswerOptionProps {
  text: string;
  state: AnswerOptionState;
  disabled?: boolean;
  onClick?: () => void;
}

const STATE_CLASSES: Record<AnswerOptionState, string> = {
  default: "border-text-secondary/20 hover:border-accent-purple/50",
  selected: "border-accent-purple bg-accent-purple/10",
  correct: "border-accent-green bg-accent-green/10",
  wrong: "border-error bg-error/10",
};

/** Card selezionabile per una opzione di risposta del quiz. */
export function AnswerOption({ text, state, disabled, onClick }: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-touch-target w-full items-center justify-between rounded-card border bg-bg-card p-4 text-left text-base text-text-primary transition duration-150 ease-in-out disabled:cursor-not-allowed ${STATE_CLASSES[state]}`}
    >
      <span>{text}</span>
      {state === "correct" && (
        <span className="ml-3 shrink-0 text-accent-green" aria-hidden="true">
          ✓
        </span>
      )}
      {state === "wrong" && (
        <span className="ml-3 shrink-0 text-error" aria-hidden="true">
          ✕
        </span>
      )}
    </button>
  );
}
