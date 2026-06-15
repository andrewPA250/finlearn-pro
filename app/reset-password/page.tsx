import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/forgot-password");
  }

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center px-6 py-12 md:min-h-screen">
      <div className="w-full max-w-sm rounded-card border border-bg-sidebar bg-bg-card p-6">
        <h1 className="text-2xl font-bold text-text-primary">Reimposta password</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Scegli una nuova password per il tuo account.
        </p>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
