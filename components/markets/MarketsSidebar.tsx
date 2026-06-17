"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SoonBadge } from "@/components/layout/SoonBadge";

const MARKET_NAV = [
  { id: "overview", label: "Overview", href: "/markets" },
  { id: "equity", label: "Stocks", href: "/markets/category/equity" },
  { id: "crypto", label: "Crypto", href: "/markets/category/crypto" },
  { id: "index", label: "Indices", href: "/markets/category/index" },
  { id: "etf", label: "ETFs", href: "/markets/category/etf" },
  { id: "commodity", label: "Commodities", href: "/markets/category/commodity" },
  { id: "forex", label: "Forex", href: "/markets/category/forex" },
  { id: "bond", label: "Bonds", href: "/markets/category/bond" },
];

const TOOLS_NAV = [
  { id: "heatmap", label: "Heatmap", href: "/markets/heatmap" },
  { id: "screener", label: "Screener", href: "/markets/screener" },
];

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted/60">
        {title}
      </p>
      {children}
    </div>
  );
}

export function MarketsSidebar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/markets") return pathname === "/markets";
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden w-48 shrink-0 flex-col gap-5 lg:flex">
      <div className="sticky top-28 flex flex-col gap-5">
        {/* Markets nav */}
        <SidebarSection title="Markets">
          <nav className="flex flex-col gap-0.5">
            {MARKET_NAV.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center rounded-card px-3 py-1.5 text-sm transition duration-150 ${
                  isActive(item.href)
                    ? "bg-cyan-bg/40 font-semibold text-cyan"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </SidebarSection>

        {/* Tools */}
        <SidebarSection title="Tools">
          <nav className="flex flex-col gap-0.5">
            {TOOLS_NAV.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center rounded-card px-3 py-1.5 text-sm transition duration-150 ${
                  isActive(item.href)
                    ? "bg-cyan-bg/40 font-semibold text-cyan"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 rounded-card px-3 py-1.5 text-sm text-text-secondary/50 cursor-default">
              Calendar <SoonBadge />
            </div>
          </nav>
        </SidebarSection>

        {/* Personal */}
        <SidebarSection title="Personal">
          <nav className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 rounded-card px-3 py-1.5 text-sm text-text-secondary/50 cursor-default">
              Watchlist <SoonBadge />
            </div>
          </nav>
        </SidebarSection>
      </div>
    </aside>
  );
}
