export interface LessonProgress {
  lessonCompleted: boolean;
  quizPassed: boolean;
  quizAttempts: number;
}

export type ProgressState = Record<number, LessonProgress>;

export const DEFAULT_LESSON_PROGRESS: LessonProgress = {
  lessonCompleted: false,
  quizPassed: false,
  quizAttempts: 0,
};
