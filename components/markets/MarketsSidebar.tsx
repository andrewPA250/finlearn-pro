"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";
import type { Language } from "@/lib/settings/types";

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-0.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted/60">
        {title}
      </p>
      {children}
    </div>
  );
}

function navLink(lang: Language) {
  return [
    { id: "overview", label: t("overview", lang), href: "/markets" },
    { id: "equity",   label: t("stocks", lang),      href: "/markets/category/equity" },
    { id: "crypto",   label: t("crypto", lang),      href: "/markets/category/crypto" },
    { id: "index",    label: t("indices", lang),     href: "/markets/category/index" },
    { id: "etf",      label: t("etf", lang),         href: "/markets/category/etf" },
    { id: "commodity",label: t("commodities", lang), href: "/markets/category/commodity" },
    { id: "forex",    label: t("forex", lang),       href: "/markets/category/forex" },
    { id: "bond",     label: t("bonds", lang),       href: "/markets/category/bond" },
  ];
}

function toolsNav(lang: Language) {
  return [
    { id: "heatmap",  label: t("heatmap", lang),  href: "/markets/heatmap" },
    { id: "screener", label: t("screener", lang), href: "/markets/screener" },
    { id: "calendar", label: t("calendar", lang), href: "/calendar" },
    { id: "news",     label: t("news", lang),     href: "/news" },
  ];
}

function personalNav(lang: Language) {
  return [
    { id: "watchlist", label: t("watchlist", lang), href: "/watchlist" },
  ];
}

export function MarketsSidebar() {
  const pathname = usePathname();
  const { language } = useSettings();

  function isActive(href: string): boolean {
    if (href === "/markets") return pathname === "/markets";
    return pathname.startsWith(href);
  }

  const linkClass = (href: string) =>
    `flex items-center rounded-card px-2.5 py-1 text-[13px] transition duration-150 ${
      isActive(href)
        ? "bg-cyan-bg/40 font-semibold text-cyan"
        : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
    }`;

  return (
    <aside className="hidden w-40 shrink-0 flex-col gap-4 lg:flex">
      <div className="sticky top-28 flex flex-col gap-4">
        <SidebarSection title={t("markets", language)}>
          <nav className="flex flex-col gap-px">
            {navLink(language).map((item) => (
              <Link key={item.id} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </SidebarSection>

        <SidebarSection title={t("tools", language)}>
          <nav className="flex flex-col gap-px">
            {toolsNav(language).map((item) => (
              <Link key={item.id} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </SidebarSection>

        <SidebarSection title={t("personal", language)}>
          <nav className="flex flex-col gap-px">
            {personalNav(language).map((item) => (
              <Link key={item.id} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </SidebarSection>
      </div>
    </aside>
  );
}
