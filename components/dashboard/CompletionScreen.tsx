import Link from "next/link";
import { ArrowRightIcon, TrophyIcon } from "@/components/layout/icons";

/** Schermata di completamento percorso, mostrata dopo la lezione 6 (sez. 7, 10 spec). */
export function CompletionScreen() {
  return (
    <div className="rounded-card border border-accent-green/40 bg-bg-card p-5 transition duration-150 ease-in-out hover:-translate-y-0.5 hover:border-accent-green/70">
      <div className="flex h-9 w-9 items-center justify-center rounded-card bg-accent-green/15 text-accent-green">
        <TrophyIcon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-accent-green">
        Percorso completato
      </p>
      <p className="mt-2 text-lg font-bold text-text-primary">
        Hai completato tutte le 6 lezioni
      </p>
      <p className="mt-1 text-sm text-text-secondary">
        Hai imparato le basi di investimento, inflazione, rischio, volatilità, diversificazione e
        correlazione, sempre collegate a dati di mercato reali. Puoi continuare a esplorare il
        grafico in modalità libera per ripassare i concetti.
      </p>
      <Link
        href="/workbench"
        className="group mt-4 flex h-touch-target w-full items-center justify-center gap-2 rounded-card bg-accent-green px-4 text-sm font-bold text-bg-primary transition duration-150 ease-in-out hover:opacity-90 md:w-auto"
      >
        Esplora il grafico
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 ease-in-out group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
