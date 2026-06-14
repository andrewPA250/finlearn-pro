"use client";

import { useEffect, useState } from "react";
import type { Quiz } from "@/types";
import { useProgress } from "@/lib/progress/ProgressContext";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizResult } from "@/components/quiz/QuizResult";

/** Numero di fallimenti a partire dal quale il tasto "Riprova" viene bloccato. */
const FAILED_ATTEMPTS_FOR_LOCK = 2;
/** Durata del blocco del tasto "Riprova", in secondi. */
const RETRY_LOCK_SECONDS = 60;

interface QuizRunnerProps {
  lessonId: number;
  quiz: Quiz;
}

/** Orchestratore del quiz: domande, valutazione, risultato e logica di retry. */
export function QuizRunner({ lessonId, quiz }: QuizRunnerProps) {
  const { getLessonProgress, setQuizPassed, incrementQuizAttempts } = useProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [attemptsAfterSubmit, setAttemptsAfterSubmit] = useState(0);
  const [retryAvailableAt, setRetryAvailableAt] = useState<number | null>(null);
  const [retryLockedSeconds, setRetryLockedSeconds] = useState(0);

  useEffect(() => {
    if (retryAvailableAt === null) {
      setRetryLockedSeconds(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((retryAvailableAt - Date.now()) / 1000));
      setRetryLockedSeconds(remaining);
      if (remaining <= 0) {
        setRetryAvailableAt(null);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [retryAvailableAt]);

  const question = quiz.questions[currentIndex];
  const isLast = currentIndex === quiz.questions.length - 1;

  function handleSelect(optionId: string) {
    if (confirmed) return;
    setSelectedOptionId(optionId);
  }

  function handleConfirm() {
    if (selectedOptionId === null) return;
    setConfirmed(true);
    setAnswers((prev) => ({ ...prev, [question.id]: selectedOptionId }));
  }

  function handleNext() {
    if (!isLast) {
      setCurrentIndex((index) => index + 1);
      setSelectedOptionId(null);
      setConfirmed(false);
      return;
    }

    const finalAnswers = { ...answers, [question.id]: selectedOptionId! };
    const correctCount = quiz.questions.reduce((count, q) => {
      const answerId = finalAnswers[q.id];
      const option = q.options.find((o) => o.id === answerId);
      return option?.isCorrect ? count + 1 : count;
    }, 0);

    const didPass = correctCount >= quiz.passThreshold;
    const previousAttempts = getLessonProgress(lessonId).quizAttempts;
    const nextAttempts = previousAttempts + 1;

    incrementQuizAttempts(lessonId);
    if (didPass) {
      setQuizPassed(lessonId, true);
    }

    if (!didPass && nextAttempts >= FAILED_ATTEMPTS_FOR_LOCK) {
      setRetryAvailableAt(Date.now() + RETRY_LOCK_SECONDS * 1000);
    }

    setScore(correctCount);
    setPassed(didPass);
    setAttemptsAfterSubmit(nextAttempts);
    setShowResult(true);
  }

  function handleRetry() {
    if (retryLockedSeconds > 0) return;
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setConfirmed(false);
    setAnswers({});
    setShowResult(false);
  }

  if (showResult) {
    return (
      <QuizResult
        lessonId={lessonId}
        score={score}
        total={quiz.questions.length}
        passThreshold={quiz.passThreshold}
        passed={passed}
        attempts={attemptsAfterSubmit}
        retryLockedSeconds={retryLockedSeconds}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <QuestionCard
      question={question}
      questionNumber={currentIndex + 1}
      totalQuestions={quiz.questions.length}
      selectedOptionId={selectedOptionId}
      confirmed={confirmed}
      isLast={isLast}
      onSelect={handleSelect}
      onConfirm={handleConfirm}
      onNext={handleNext}
    />
  );
}
