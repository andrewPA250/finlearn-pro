"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartIcon, DashboardIcon, BookIcon, UserIcon } from "@/components/layout/icons";

const ITEMS = [
  { href: "/", label: "Home", Icon: DashboardIcon, isActive: (p: string) => p === "/" },
  { href: "/lessons/1", label: "Lezioni", Icon: BookIcon, isActive: (p: string) => p.startsWith("/lessons") },
  { href: "/workbench", label: "Grafico", Icon: ChartIcon, isActive: (p: string) => p === "/workbench" },
  { href: "/profile", label: "Profilo", Icon: UserIcon, isActive: (p: string) => p === "/profile" },
];

export function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex h-touch-target items-center justify-around border-t border-bg-card bg-bg-sidebar md:hidden">
      {ITEMS.map(({ href, label, Icon, isActive }) => {
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
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
