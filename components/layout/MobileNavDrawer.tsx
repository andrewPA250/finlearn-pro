"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";
import {
  DashboardIcon,
  ChartIcon,
  PulseIcon,
  SparkleIcon,
  PortfolioIcon,
  StarIcon,
  BellIcon,
  CalendarIcon,
  NewspaperIcon,
  BookIcon,
  GearIcon,
  UserIcon,
  CloseIcon,
} from "@/components/layout/icons";

interface DrawerItem {
  label: string;
  href: string;
  Icon: (props: { className?: string }) => JSX.Element;
  isActive: (pathname: string) => boolean;
}

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  learnHref: string;
}

/** Drawer mobile (md:hidden) con accesso a tutte le sezioni principali dell'app. */
export function MobileNavDrawer({ open, onClose, learnHref }: MobileNavDrawerProps) {
  const pathname = usePathname() ?? "";
  const { language } = useSettings();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const items: DrawerItem[] = [
    { label: t("home", language), href: "/", Icon: DashboardIcon, isActive: (p) => p === "/" },
    { label: t("markets", language), href: "/markets", Icon: ChartIcon, isActive: (p) => p.startsWith("/markets") || p.startsWith("/asset") },
    { label: t("quantLab", language), href: "/analytics/compare", Icon: PulseIcon, isActive: (p) => p.startsWith("/analytics") },
    { label: t("aiAnalyst", language), href: "/ai", Icon: SparkleIcon, isActive: (p) => p.startsWith("/ai") },
    { label: t("portfolio", language), href: "/portfolio", Icon: PortfolioIcon, isActive: (p) => p.startsWith("/portfolio") },
    { label: t("watchlist", language), href: "/watchlist", Icon: StarIcon, isActive: (p) => p.startsWith("/watchlist") },
    { label: t("alerts", language), href: "/alerts", Icon: BellIcon, isActive: (p) => p.startsWith("/alerts") },
    { label: t("calendar", language), href: "/calendar", Icon: CalendarIcon, isActive: (p) => p.startsWith("/calendar") },
    { label: t("news", language), href: "/news", Icon: NewspaperIcon, isActive: (p) => p.startsWith("/news") },
    { label: t("learn", language), href: learnHref, Icon: BookIcon, isActive: (p) => p.startsWith("/lessons") },
    { label: t("settings", language), href: "/settings", Icon: GearIcon, isActive: (p) => p.startsWith("/settings") },
    { label: t("profile", language), href: "/profile", Icon: UserIcon, isActive: (p) => p === "/profile" },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Chiudi menu"
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`absolute inset-y-0 left-0 flex h-full w-72 max-w-[80vw] flex-col border-r border-bg-border/40 bg-bg-sidebar shadow-xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-bg-border/40 px-4">
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            Finance<span className="text-cyan">Hub</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi menu"
            className="flex h-8 w-8 items-center justify-center rounded-card text-text-secondary transition duration-150 ease-in-out hover:bg-bg-hover hover:text-text-primary"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {items.map(({ label, href, Icon, isActive }) => {
            const active = isActive(pathname);
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition duration-150 ease-in-out ${
                  active
                    ? "bg-cyan/10 text-cyan font-semibold"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
