"use client";

import { usePathname } from "next/navigation";
import { LearnSidebar } from "@/components/sidebar/LearnSidebar";

/**
 * Sidebar contestuale: in base alla sezione dell'app attiva, mostra la
 * sidebar secondaria di quel modulo (o nessuna sidebar per le sezioni che
 * non ne hanno una). Header e bottom nav restano la navigazione globale.
 *
 * Estensioni future: MarketsSidebar per /markets, PortfolioSidebar per /portfolio.
 */
export function ContextSidebar() {
  const pathname = usePathname() ?? "";

  if (pathname.startsWith("/lessons")) {
    return <LearnSidebar />;
  }

  return null;
}
