import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-6.5rem)] flex-col items-center justify-center px-6 py-12 md:min-h-[calc(100vh-3.5rem)]">
      <div className="w-full max-w-sm rounded-card border border-bg-sidebar bg-bg-card p-6">
        <h1 className="text-2xl font-bold text-text-primary">Accedi</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Accedi al tuo account FinanceHub per continuare il percorso.
        </p>

        {searchParams.error === "auth_callback_error" && (
          <p className="mt-4 rounded-card border border-error/30 bg-error/10 p-3 text-sm text-error">
            Il link di conferma non è valido o è scaduto. Riprova ad accedere o registrati di
            nuovo.
          </p>
        )}

        <LoginForm />

        <p className="mt-6 text-center text-sm text-text-secondary">
          Non hai un account?{" "}
          <Link href="/register" className="font-bold text-accent-purple hover:opacity-90">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
