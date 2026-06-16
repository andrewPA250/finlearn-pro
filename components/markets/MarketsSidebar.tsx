"use client";

import { useState } from "react";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface MarketsSidebarProps {
  activeCategory?: string;
  onCategoryChange?: (id: string) => void;
}

const MARKET_NAV = [
  { id: "all",       label: "Overview",    href: "#overview"    },
  { id: "equity",    label: "Stocks",      href: "#equity"      },
  { id: "crypto",    label: "Crypto",      href: "#crypto"      },
  { id: "index",     label: "Indices",     href: "#index"       },
  { id: "etf",       label: "ETFs",        href: "#etf"         },
  { id: "commodity", label: "Commodities", href: "#commodity"   },
  { id: "forex",     label: "Forex",       href: "#forex"       },
  { id: "bond",      label: "Bonds",       href: "#bond"        },
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

export function MarketsSidebar({ activeCategory = "all", onCategoryChange }: MarketsSidebarProps) {
  const [active, setActive] = useState(activeCategory);

  function handleClick(id: string) {
    setActive(id);
    onCategoryChange?.(id);
  }

  return (
    <aside className="hidden w-48 shrink-0 flex-col gap-5 lg:flex">
      <div className="sticky top-28 flex flex-col gap-5">
        {/* Markets nav */}
        <SidebarSection title="Markets">
          <nav className="flex flex-col gap-0.5">
            {MARKET_NAV.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => handleClick(item.id)}
                className={`flex items-center rounded-card px-3 py-1.5 text-sm transition duration-150 ${
                  active === item.id
                    ? "bg-cyan-bg/40 font-semibold text-cyan"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </SidebarSection>

        {/* Tools */}
        <SidebarSection title="Tools">
          <nav className="flex flex-col gap-0.5">
            <a
              href="#heatmap"
              onClick={() => handleClick("heatmap")}
              className={`flex items-center rounded-card px-3 py-1.5 text-sm transition duration-150 ${
                active === "heatmap"
                  ? "bg-cyan-bg/40 font-semibold text-cyan"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`}
            >
              Heatmap
            </a>
            <span className="flex items-center gap-2 rounded-card px-3 py-1.5 text-sm text-text-secondary/50 cursor-default">
              Calendar <SoonBadge />
            </span>
            <span className="flex items-center gap-2 rounded-card px-3 py-1.5 text-sm text-text-secondary/50 cursor-default">
              Screener <SoonBadge />
            </span>
          </nav>
        </SidebarSection>

        {/* Personal */}
        <SidebarSection title="Personal">
          <nav className="flex flex-col gap-0.5">
            <span className="flex items-center gap-2 rounded-card px-3 py-1.5 text-sm text-text-secondary/50 cursor-default">
              Watchlist <SoonBadge />
            </span>
          </nav>
        </SidebarSection>
      </div>
    </aside>
  );
}
