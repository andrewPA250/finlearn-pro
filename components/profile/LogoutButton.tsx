"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const buttonClassName =
  "mt-2 min-h-touch-target w-full rounded-card border border-text-secondary/20 bg-bg-primary px-6 py-3 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:border-error/60 hover:text-error disabled:cursor-not-allowed disabled:opacity-60 md:w-auto";

/** Effettua il logout e reindirizza a /login. */
export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} disabled={loading} className={buttonClassName}>
      {loading ? "Uscita in corso..." : "Esci"}
    </button>
  );
}
