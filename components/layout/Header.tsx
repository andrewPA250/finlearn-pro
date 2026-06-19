"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "@/lib/progress/ProgressContext";
import { useSettings } from "@/lib/settings/SettingsContext";
import { useWatchlist } from "@/lib/watchlist/WatchlistContext";
import { useAvatar } from "@/lib/avatar/AvatarContext";
import { t } from "@/lib/settings/i18n";
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
  const settings = useSettings();
  const { symbols: watchlistSymbols } = useWatchlist();
  const { avatarUrl } = useAvatar();
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

  const lang = settings.language;
  const navItems: NavItem[] = [
    { label: t("markets", lang), href: "/markets", isActive: (p) => p.startsWith("/markets") || p.startsWith("/asset") },
    { label: t("analytics", lang), href: "/analytics/compare", isActive: (p) => p.startsWith("/analytics") },
    { label: t("learn", lang), href: learnHref, isActive: (p) => p.startsWith("/lessons") },
    { label: t("portfolio", lang), href: "/portfolio", isActive: (p) => p.startsWith("/portfolio") },
    { label: t("alerts", lang), href: "/alerts", isActive: (p) => p.startsWith("/alerts") },
    { label: t("calendar", lang), href: "/calendar", isActive: (p) => p.startsWith("/calendar") },
    { label: t("aiAnalyst", lang), href: "/ai", isActive: (p) => p.startsWith("/ai") },
    { label: t("quantLab", lang), soon: true },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-bg-border/40 bg-bg-sidebar px-4 md:gap-3 md:px-6">
      <Link href="/" className="flex shrink-0 items-center gap-2.5">
        <LogoMark className="h-8 w-8" />
        <span className="hidden text-[15px] font-semibold tracking-tight text-text-primary sm:inline">
          Finance<span className="text-cyan">Hub</span>
        </span>
      </Link>

      <nav className="hidden flex-1 items-center gap-0.5 md:flex">
        {navItems.map((item) => {
          if (item.soon) {
            return (
              <span
                key={item.label}
                className="flex cursor-default items-center gap-1.5 rounded-card px-3 py-2 text-sm text-text-secondary/60"
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
              className={`rounded-card px-3 py-2 text-sm font-medium transition duration-150 ease-in-out ${
                active
                  ? "bg-cyan/10 text-cyan font-semibold"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
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
        className="hidden max-w-xs flex-1 items-center gap-2 rounded-card border border-bg-border/50 bg-bg-card/40 px-3 py-2 text-sm text-text-secondary transition duration-150 ease-in-out hover:border-cyan/30 hover:bg-bg-hover focus-visible:border-cyan/40 focus-visible:outline-none lg:flex"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="flex-1 text-left text-text-muted">{t("searchAssets", lang)}</span>
        <kbd className="rounded border border-text-disabled/30 px-1.5 py-0.5 font-mono text-[10px] text-text-disabled">
          Ctrl K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Apri ricerca"
        className="flex items-center justify-center rounded-card p-2 text-text-secondary transition duration-150 ease-in-out hover:bg-bg-hover hover:text-text-primary lg:hidden"
      >
        <SearchIcon className="h-4 w-4" />
      </button>

      <div className="relative ml-auto shrink-0">
        {user ? (
          <>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-card px-2 py-1.5 transition duration-150 ease-in-out hover:bg-bg-hover"
              aria-label="Menu account"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan/20 bg-cyan/10 text-xs font-bold text-cyan">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : user.email ? (
                  user.email[0]?.toUpperCase()
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
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
                <div className="absolute right-0 top-full z-40 mt-2 w-56 animate-fade-in-up rounded-card border border-bg-border/50 bg-bg-card p-2 shadow-lg shadow-black/30">
                  <p className="truncate px-3 py-1.5 text-xs text-text-muted">{user.email}</p>
                  <div className="flex gap-2 px-3 py-1.5 text-[10px] text-text-muted/70">
                    <span>{t(settings.language === "en" ? "english" : "italiano", settings.language)}</span>
                    <span>•</span>
                    <span>{settings.currency}</span>
                  </div>
                  <hr className="my-1 border-bg-border/50" />
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-card px-3 py-2 text-sm text-text-secondary transition duration-150 ease-in-out hover:bg-bg-hover hover:text-text-primary"
                  >
                    <UserIcon className="h-4 w-4" />
                    {t("profile", settings.language)}
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-card px-3 py-2 text-sm text-text-secondary transition duration-150 ease-in-out hover:bg-bg-hover hover:text-text-primary"
                  >
                    <span className="text-text-muted">⚙</span>
                    {t("settings", settings.language)}
                  </Link>
                  <div className="flex items-center gap-2.5 rounded-card px-3 py-2 text-sm text-text-secondary cursor-default">
                    <span className="text-cyan/70">★</span>
                    <span>{t("watchlist", settings.language)} ({watchlistSymbols.length})</span>
                  </div>
                  <hr className="my-1 border-bg-border/50" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-card px-3 py-2 text-left text-sm text-negative transition duration-150 ease-in-out hover:bg-bg-hover"
                  >
                    {t("signOut", settings.language)}
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-card bg-cyan px-4 py-2 text-sm font-semibold text-bg-primary transition duration-150 ease-in-out hover:bg-cyan-dark"
          >
            {t("signIn", lang)}
          </Link>
        )}
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} learnHref={learnHref} />
    </header>
  );
}
