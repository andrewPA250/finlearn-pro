import Link from "next/link";
import { ArrowRightIcon, ChartIcon } from "@/components/layout/icons";

/** Card statica con tasto "Apri grafico" (sez. 4 spec — nessun rendering grafico). */
export function WorkbenchCard() {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-bg-sidebar bg-bg-card p-5 transition duration-150 ease-in-out hover:-translate-y-0.5 hover:border-accent-purple/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card bg-accent-purple/15 text-accent-purple">
          <ChartIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">Grafico</p>
          <p className="mt-1 text-base font-bold text-text-primary">Esplora i dati di mercato</p>
          <p className="mt-1 text-sm text-text-secondary">
            S&amp;P 500, Oro e US Treasury 10Y — normalizzati a base 100, con overlay statistici.
          </p>
        </div>
      </div>
      <Link
        href="/workbench"
        className="group flex h-touch-target shrink-0 items-center justify-center gap-2 rounded-card bg-accent-purple px-4 text-sm font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90"
      >
        Apri grafico
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 ease-in-out group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
