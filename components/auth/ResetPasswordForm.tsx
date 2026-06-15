"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/auth/PasswordInput";

const inputClassName =
  "w-full rounded-card border border-text-secondary/20 bg-bg-primary px-4 py-3 text-base text-text-primary placeholder:text-text-secondary/50 focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "mt-2 min-h-touch-target w-full rounded-card bg-accent-purple px-6 py-3 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

function mapAuthError(message: string): string {
  if (message.toLowerCase().includes("password should be at least")) {
    return "La password deve contenere almeno 6 caratteri.";
  }
  if (message.toLowerCase().includes("different from the old password")) {
    return "La nuova password deve essere diversa da quella attuale.";
  }
  if (message.toLowerCase().includes("auth session missing")) {
    return "Il link di reset non è più valido. Richiedi un nuovo link.";
  }
  return "Si è verificato un errore. Riprova.";
}

/** Form di reset password: richiede una sessione di recovery attiva (da /auth/callback). */
export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(mapAuthError(error.message));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-bold text-text-primary">
          Nuova password
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
          Conferma nuova password
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
        {loading ? "Salvataggio..." : "Aggiorna password"}
      </button>
    </form>
  );
}
