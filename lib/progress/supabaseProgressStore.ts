import type { SupabaseClient } from "@supabase/supabase-js";
import type { LessonProgress, ProgressState } from "@/types/progress";

interface LessonProgressRow {
  lesson_id: number;
  lesson_completed: boolean;
  quiz_passed: boolean;
  quiz_attempts: number;
}

/**
 * Accesso alla tabella `lesson_progress` per un utente autenticato.
 * Le chiamate sono asincrone: l'aggiornamento ottimistico dello stato
 * locale e la gestione degli errori sono a carico di `ProgressContext`.
 */
export class SupabaseProgressStore {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {}

  /** Legge tutti i progressi dell'utente da Supabase. */
  async fetchState(): Promise<ProgressState> {
    const { data, error } = await this.supabase
      .from("lesson_progress")
      .select("lesson_id, lesson_completed, quiz_passed, quiz_attempts")
      .eq("user_id", this.userId);

    if (error) throw error;

    const state: ProgressState = {};
    for (const row of (data ?? []) as LessonProgressRow[]) {
      state[row.lesson_id] = {
        lessonCompleted: row.lesson_completed,
        quizPassed: row.quiz_passed,
        quizAttempts: row.quiz_attempts,
      };
    }
    return state;
  }

  /** Scrive (upsert) il progresso di una lezione. */
  async upsertLessonProgress(lessonId: number, progress: LessonProgress): Promise<void> {
    const { error } = await this.supabase.from("lesson_progress").upsert(
      {
        user_id: this.userId,
        lesson_id: lessonId,
        lesson_completed: progress.lessonCompleted,
        quiz_passed: progress.quizPassed,
        quiz_attempts: progress.quizAttempts,
      },
      { onConflict: "user_id,lesson_id" }
    );

    if (error) throw error;
  }

  /** Elimina tutti i progressi dell'utente da Supabase. */
  async resetProgress(): Promise<void> {
    const { error } = await this.supabase
      .from("lesson_progress")
      .delete()
      .eq("user_id", this.userId);

    if (error) throw error;
  }

  /** Migrazione one-time: scrive su Supabase lo stato letto da localStorage. */
  async migrateFromLocalState(localState: ProgressState): Promise<void> {
    const rows = Object.entries(localState).map(([lessonId, progress]) => ({
      user_id: this.userId,
      lesson_id: Number(lessonId),
      lesson_completed: progress.lessonCompleted,
      quiz_passed: progress.quizPassed,
      quiz_attempts: progress.quizAttempts,
    }));

    if (rows.length === 0) return;

    const { error } = await this.supabase
      .from("lesson_progress")
      .upsert(rows, { onConflict: "user_id,lesson_id" });

    if (error) throw error;
  }
}
