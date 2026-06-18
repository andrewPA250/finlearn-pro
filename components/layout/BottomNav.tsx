"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartIcon, DashboardIcon, PortfolioIcon, UserIcon } from "@/components/layout/icons";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";

const ITEMS = [
  { href: "/", labelKey: "home", Icon: DashboardIcon, isActive: (p: string) => p === "/" },
  { href: "/markets", labelKey: "markets", Icon: ChartIcon, isActive: (p: string) => p.startsWith("/markets") || p.startsWith("/asset") },
  { href: "/portfolio", labelKey: "portfolio", Icon: PortfolioIcon, isActive: (p: string) => p.startsWith("/portfolio") },
  { href: "/profile", labelKey: "profile", Icon: UserIcon, isActive: (p: string) => p === "/profile" },
] as const;

export function BottomNav() {
  const pathname = usePathname() ?? "";
  const { language } = useSettings();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex h-touch-target items-center justify-around border-t border-bg-card bg-bg-sidebar md:hidden">
      {ITEMS.map(({ href, labelKey, Icon, isActive }) => {
        const active = isActive(pathname);

        return (
          <Link
            key={href}
            href={href}
            className={`flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-xs transition duration-150 ease-in-out ${
              active ? "text-accent-purple" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
            {t(labelKey, language)}
          </Link>
        );
      })}
    </nav>
  );
}
