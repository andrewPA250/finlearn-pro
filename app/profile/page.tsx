import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ResetProgressButton } from "@/components/profile/ResetProgressButton";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", data.user.id)
    .maybeSingle();

  return (
    <div className="mx-auto flex max-w-reading flex-col gap-6 p-6">
      <div className="animate-fade-in-up rounded-card bg-bg-card p-6">
        <h1 className="text-2xl font-bold text-text-primary">Profilo</h1>
        <p className="mt-1 text-sm text-text-secondary">{data.user.email}</p>

        <div className="mt-6 border-b border-bg-border/50 pb-6">
          <AvatarUpload initials={data.user.email ? data.user.email[0]!.toUpperCase() : ""} />
        </div>

        <div className="mt-6">
          <ProfileForm userId={data.user.id} initialDisplayName={profile?.display_name ?? ""} />
        </div>
      </div>

      <div
        className="animate-fade-in-up rounded-card bg-bg-card p-6"
        style={{ animationDelay: "75ms" }}
      >
        <h2 className="text-lg font-bold text-text-primary">Progressi</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Azzera lezioni completate, quiz superati e tentativi.
        </p>

        <div className="mt-4">
          <ResetProgressButton />
        </div>
      </div>

      <div
        className="animate-fade-in-up rounded-card bg-bg-card p-6"
        style={{ animationDelay: "150ms" }}
      >
        <h2 className="text-lg font-bold text-text-primary">Account</h2>

        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
