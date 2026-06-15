import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center px-6 py-12 md:min-h-screen">
      <div className="w-full max-w-sm rounded-card border border-bg-sidebar bg-bg-card p-6">
        <h1 className="text-2xl font-bold text-text-primary">Crea un account</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Registrati per salvare i tuoi progressi su FinLearn Pro.
        </p>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-text-secondary">
          Hai già un account?{" "}
          <Link href="/login" className="font-bold text-accent-purple hover:opacity-90">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
