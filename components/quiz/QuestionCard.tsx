import type { QuizOption, QuizQuestion } from "@/types";
import { AnswerOption, type AnswerOptionState } from "@/components/quiz/AnswerOption";
import { FeedbackBlock } from "@/components/quiz/FeedbackBlock";

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  confirmed: boolean;
  isLast: boolean;
  onSelect: (optionId: string) => void;
  onConfirm: () => void;
  onNext: () => void;
}

/** Domanda del quiz: testo + 4 opzioni selezionabili + feedback dopo la conferma. */
export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  confirmed,
  isLast,
  onSelect,
  onConfirm,
  onNext,
}: QuestionCardProps) {
  const selectedOption = question.options.find((option) => option.id === selectedOptionId);

  function getOptionState(option: QuizOption): AnswerOptionState {
    if (!confirmed) {
      return option.id === selectedOptionId ? "selected" : "default";
    }
    if (option.isCorrect) return "correct";
    if (option.id === selectedOptionId) return "wrong";
    return "default";
  }

  return (
    <div className="rounded-card border border-text-secondary/10 bg-bg-card p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-accent-purple">
        Domanda {questionNumber} di {totalQuestions}
      </p>
      <h2 className="mt-2 text-lg font-bold text-text-primary">{question.question}</h2>

      <div className="mt-4 flex flex-col gap-3">
        {question.options.map((option) => (
          <AnswerOption
            key={option.id}
            text={option.text}
            state={getOptionState(option)}
            disabled={confirmed}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>

      {confirmed && selectedOption && (
        <FeedbackBlock text={selectedOption.feedback} isCorrect={selectedOption.isCorrect} />
      )}

      <div className="mt-6">
        {!confirmed ? (
          <button
            type="button"
            onClick={onConfirm}
            disabled={selectedOptionId === null}
            className="min-h-touch-target w-full rounded-card bg-accent-purple px-6 py-3 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
          >
            Conferma risposta
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="min-h-touch-target w-full rounded-card bg-accent-purple px-6 py-3 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 md:w-auto"
          >
            {isLast ? "Vedi risultato" : "Domanda successiva"}
          </button>
        )}
      </div>
    </div>
  );
}
