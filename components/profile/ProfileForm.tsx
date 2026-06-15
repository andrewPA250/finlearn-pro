"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClassName =
  "w-full rounded-card border border-text-secondary/20 bg-bg-primary px-4 py-3 text-base text-text-primary placeholder:text-text-secondary/50 focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "mt-2 min-h-touch-target w-full rounded-card bg-accent-purple px-6 py-3 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto";

interface ProfileFormProps {
  userId: string;
  initialDisplayName: string;
}

/** Form per modificare il nome visualizzato (display_name) del profilo. */
export function ProfileForm({ userId, initialDisplayName }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      setError("Si è verificato un errore durante il salvataggio. Riprova.");
      return;
    }

    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm font-bold text-text-primary">
          Nome <span className="font-normal text-text-secondary">(opzionale)</span>
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value);
            setSuccess(false);
          }}
          className={inputClassName}
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {success && <p className="text-sm text-accent-green">Nome aggiornato.</p>}

      <button type="submit" disabled={loading} className={buttonClassName}>
        {loading ? "Salvataggio..." : "Salva"}
      </button>
    </form>
  );
}
