import fs from "fs";
import path from "path";
import type { Quiz } from "@/types";

export { LESSON_META, getAllLessonIds, getLessonMeta } from "@/lib/lessonsMeta";

const CONTENT_DIR = path.join(process.cwd(), "content", "lessons");
const QUIZ_DIR = path.join(CONTENT_DIR, "quizzes");

export function getLessonContent(id: number): string {
  const filePath = path.join(CONTENT_DIR, `lesson-${id}.md`);
  return fs.readFileSync(filePath, "utf-8");
}

export function getQuiz(id: number): Quiz {
  const filePath = path.join(QUIZ_DIR, `quiz-${id}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Quiz;
}
