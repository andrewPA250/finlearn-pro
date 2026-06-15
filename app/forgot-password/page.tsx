import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-6.5rem)] flex-col items-center justify-center px-6 py-12 md:min-h-[calc(100vh-3.5rem)]">
      <div className="w-full max-w-sm rounded-card border border-bg-sidebar bg-bg-card p-6">
        <h1 className="text-2xl font-bold text-text-primary">Password dimenticata?</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Inserisci la tua email: ti invieremo un link per reimpostare la password.
        </p>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
