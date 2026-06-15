"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/auth/PasswordInput";

const inputClassName =
  "w-full rounded-card border border-text-secondary/20 bg-bg-primary px-4 py-3 text-base text-text-primary placeholder:text-text-secondary/50 focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "mt-2 min-h-touch-target w-full rounded-card bg-accent-purple px-6 py-3 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

function mapAuthError(message: string): string {
  if (message.toLowerCase().includes("already registered")) {
    return "Esiste già un account con questa email.";
  }
  if (message.toLowerCase().includes("password should be at least")) {
    return "La password deve contenere almeno 6 caratteri.";
  }
  if (message.toLowerCase().includes("unable to validate email")) {
    return "L'indirizzo email non è valido.";
  }
  return "Si è verificato un errore. Riprova.";
}

/** Form di registrazione: email + password (+ nome opzionale), invia email di conferma. */
export function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: displayName.trim() ? { display_name: displayName.trim() } : undefined,
      },
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
        Registrazione completata. Controlla la tua casella email e clicca sul link di conferma
        per attivare l&apos;account.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
          onChange={(event) => setDisplayName(event.target.value)}
          className={inputClassName}
        />
      </div>

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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-bold text-text-primary">
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-bold text-text-primary">
          Conferma password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={inputClassName}
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <button type="submit" disabled={loading} className={buttonClassName}>
        {loading ? "Creazione account..." : "Crea account"}
      </button>
    </form>
  );
}
