"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClassName =
  "w-full rounded-card border border-text-secondary/20 bg-bg-primary px-4 py-3 text-base text-text-primary placeholder:text-text-secondary/50 focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "mt-2 min-h-touch-target w-full rounded-card bg-accent-purple px-6 py-3 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

function mapAuthError(message: string): string {
  if (message.toLowerCase().includes("unable to validate email")) {
    return "L'indirizzo email non è valido.";
  }
  if (message.toLowerCase().includes("security purposes")) {
    return "Hai richiesto un reset troppo di recente. Riprova tra qualche istante.";
  }
  return "Si è verificato un errore. Riprova.";
}

/** Form "password dimenticata": invia l'email di reset password. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(mapAuthError(error.message));
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="mt-6 rounded-card border border-accent-green/30 bg-accent-green/10 p-4 text-sm text-accent-green">
        Se esiste un account con questa email, riceverai a breve un link per reimpostare la
        password.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-bold text-text-primary">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <button type="submit" disabled={loading} className={buttonClassName}>
        {loading ? "Invio in corso..." : "Invia link di reset"}
      </button>

      <p className="text-center text-sm text-text-secondary">
        <Link href="/login" className="font-bold text-accent-purple hover:opacity-90">
          Torna al login
        </Link>
      </p>
    </form>
  );
}
