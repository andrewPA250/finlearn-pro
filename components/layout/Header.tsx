"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "@/lib/progress/ProgressContext";
import { getNextAccessibleLessonId } from "@/lib/access";
import { ChevronDownIcon, LogoMark, SearchIcon, UserIcon } from "@/components/layout/icons";
import { SoonBadge } from "@/components/layout/SoonBadge";
import { SearchOverlay } from "@/components/search/SearchOverlay";

interface NavItem {
  label: string;
  href?: string;
  soon?: boolean;
  isActive?: (pathname: string) => boolean;
}

/** Header globale fisso in alto: logo, navigazione primaria, search (anteprima) e account menu. */
export function Header() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { state } = useProgress();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/login");
    router.refresh();
  }

  const learnHref = `/lessons/${getNextAccessibleLessonId(state)}`;

  const navItems: NavItem[] = [
    { label: "Home", href: "/dashboard", isActive: (p) => p === "/dashboard" },
    { label: "Markets", href: "/markets", isActive: (p) => p.startsWith("/markets") || p.startsWith("/asset") },
    { label: "Learn", href: learnHref, isActive: (p) => p.startsWith("/lessons") },
    { label: "Portfolio", soon: true },
    { label: "AI", soon: true },
    { label: "Workbench", href: "/workbench", isActive: (p) => p === "/workbench" },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-bg-card/60 bg-bg-sidebar px-4 md:gap-4 md:px-6">
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <LogoMark className="h-7 w-7" />
        <span className="hidden text-sm font-bold text-text-primary sm:inline">
          Finance<span className="text-accent-purple">Hub</span>
        </span>
      </Link>

      <nav className="hidden flex-1 items-center gap-1 md:flex">
        {navItems.map((item) => {
          if (item.soon) {
            return (
              <span
                key={item.label}
                className="flex cursor-default items-center gap-1.5 rounded-card px-3 py-1.5 text-sm text-text-secondary/60"
              >
                {item.label}
                <SoonBadge />
              </span>
            );
          }

          const active = item.isActive?.(pathname) ?? false;

          return (
            <Link
              key={item.label}
              href={item.href!}
              className={`rounded-card px-3 py-1.5 text-sm transition duration-150 ease-in-out ${
                active
                  ? "bg-accent-purple/15 font-bold text-text-primary"
                  : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="hidden max-w-xs flex-1 items-center gap-2 rounded-card border border-bg-card bg-bg-primary px-3 py-1.5 text-sm text-text-secondary transition duration-150 ease-in-out hover:border-accent-purple/40 lg:flex"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="flex-1 text-left text-text-secondary/60">Cerca...</span>
        <kbd className="rounded border border-text-secondary/20 px-1.5 py-0.5 font-mono text-[10px]">
          Ctrl K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Apri ricerca"
        className="flex items-center justify-center rounded-card p-2 text-text-secondary transition duration-150 ease-in-out hover:bg-bg-card hover:text-text-primary lg:hidden"
      >
        <SearchIcon className="h-4 w-4" />
      </button>

      <div className="relative ml-auto shrink-0">
        {user ? (
          <>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-1.5 rounded-card px-2 py-1.5 transition duration-150 ease-in-out hover:bg-bg-card"
              aria-label="Menu account"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-purple/15 text-xs font-bold text-accent-purple">
                {user.email ? user.email[0]?.toUpperCase() : <UserIcon className="h-4 w-4" />}
              </span>
              <ChevronDownIcon className="h-3.5 w-3.5 text-text-secondary" />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Chiudi menu"
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-card border border-bg-card bg-bg-sidebar p-2 shadow-lg">
                  <p className="truncate px-3 py-1.5 text-xs text-text-secondary">{user.email}</p>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-card px-3 py-2 text-sm text-text-secondary transition duration-150 ease-in-out hover:bg-bg-card hover:text-text-primary"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profilo
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-card px-3 py-2 text-left text-sm text-text-secondary transition duration-150 ease-in-out hover:bg-bg-card hover:text-error"
                  >
                    Esci
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-card bg-accent-purple px-4 py-1.5 text-sm font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90"
          >
            Accedi
          </Link>
        )}
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} learnHref={learnHref} />
    </header>
  );
}
