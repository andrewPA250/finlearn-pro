"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/auth/PasswordInput";

const inputClassName =
  "w-full rounded-card border border-text-secondary/20 bg-bg-primary px-4 py-3 text-base text-text-primary placeholder:text-text-secondary/50 focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "mt-2 min-h-touch-target w-full rounded-card bg-accent-purple px-6 py-3 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

function mapAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Email o password non corretti.";
  }
  if (message.includes("Email not confirmed")) {
    return "Devi confermare l'email prima di accedere. Controlla la tua casella di posta.";
  }
  return "Si è verificato un errore. Riprova.";
}

/** Form di login: email + password, redirect a /dashboard in caso di successo. */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(mapAuthError(error.message));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-bold text-text-primary">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-accent-purple hover:opacity-90">
            Password dimenticata?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <button type="submit" disabled={loading} className={buttonClassName}>
        {loading ? "Accesso in corso..." : "Accedi"}
      </button>
    </form>
  );
}
