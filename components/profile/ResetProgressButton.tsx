"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress/ProgressContext";

const dangerButtonClassName =
  "min-h-touch-target w-full rounded-card bg-error px-6 py-3 text-base font-bold text-bg-primary transition duration-150 ease-in-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto";

const secondaryButtonClassName =
  "min-h-touch-target w-full rounded-card border border-text-secondary/20 bg-bg-primary px-6 py-3 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:border-accent-purple/60 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto";

/** Reset dei progressi (lezioni completate, quiz superati, tentativi) con conferma. */
export function ResetProgressButton() {
  const { resetProgress } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    try {
      await resetProgress();
      setSuccess(true);
      setConfirming(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il reset dei progressi.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <p className="rounded-card border border-accent-green/30 bg-accent-green/10 p-3 text-sm text-accent-green">
        Progressi azzerati.
      </p>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-3 rounded-card border border-error/30 bg-error/10 p-4">
        <p className="text-sm text-error">
          Sei sicuro? Tutti i progressi (lezioni completate, quiz superati, tentativi) verranno
          eliminati definitivamente.
        </p>
        {error && <p className="text-sm text-error">{error}</p>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={handleConfirm} disabled={loading} className={dangerButtonClassName}>
            {loading ? "Reset in corso..." : "Sì, azzera i progressi"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={loading}
            className={secondaryButtonClassName}
          >
            Annulla
          </button>
        </div>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} className={secondaryButtonClassName}>
      Reset progressi
    </button>
  );
}
