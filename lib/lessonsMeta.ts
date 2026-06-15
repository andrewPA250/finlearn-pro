import type { LessonMeta } from "@/types";

export const LESSON_META: LessonMeta[] = [
  {
    id: 1,
    title: "Cos'è investire",
    keyConcept: "Rendimento del capitale nel tempo",
    chartAssets: ["sp500"],
    defaultOverlays: [],
  },
  {
    id: 2,
    title: "Inflazione e potere d'acquisto",
    keyConcept: "Erosione reale del denaro",
    chartAssets: ["sp500", "us10y"],
    defaultOverlays: [],
  },
  {
    id: 3,
    title: "Rischio e rendimento",
    keyConcept: "Relazione rischio/rendimento",
    chartAssets: ["sp500", "us10y"],
    defaultOverlays: [],
  },
  {
    id: 4,
    title: "Volatilità",
    keyConcept: "Dispersione dei rendimenti",
    chartAssets: ["sp500"],
    defaultOverlays: ["stdDev"],
  },
  {
    id: 5,
    title: "Diversificazione",
    keyConcept: "Riduzione del rischio specifico",
    chartAssets: ["sp500", "gold"],
    defaultOverlays: [],
  },
  {
    id: 6,
    title: "Correlazione tra asset",
    keyConcept: "Correlazione e costruzione del portafoglio",
    chartAssets: ["sp500", "gold"],
    defaultOverlays: [],
  },
];

export function getAllLessonIds(): number[] {
  return LESSON_META.map((lesson) => lesson.id);
}

export function getLessonMeta(id: number): LessonMeta | undefined {
  return LESSON_META.find((lesson) => lesson.id === id);
}
