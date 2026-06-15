import Link from "next/link";
import { ArrowRightIcon, BookIcon, ChartIcon, LogoMark } from "@/components/layout/icons";

const FEATURES = [
  {
    Icon: BookIcon,
    title: "6 lezioni brevi",
    description: "Concetti chiave di investimento, inflazione e rischio, spiegati in modo diretto.",
  },
  {
    Icon: ChartIcon,
    title: "Dati di mercato reali",
    description: "S&P 500, Oro e US Treasury 10Y, aggiornati da fonti ufficiali (FRED, Stooq).",
  },
  {
    Icon: ArrowRightIcon,
    title: "Grafico interattivo",
    description: "Confronta gli asset con overlay statistici per fissare ogni concetto.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-6.5rem)] flex-col items-center justify-center gap-12 px-6 py-12 text-center md:min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col items-center gap-6">
        <LogoMark className="h-14 w-14 animate-fade-in-up" />
        <div className="flex flex-col gap-3">
          <h1 className="animate-fade-in-up text-4xl font-bold" style={{ animationDelay: "60ms" }}>
            Finance<span className="text-accent-purple">Hub</span>
          </h1>
          <p
            className="max-w-reading animate-fade-in-up text-base text-text-secondary"
            style={{ animationDelay: "120ms" }}
          >
            Impara le basi degli investimenti, dell&apos;inflazione e del rischio con Learn: 6
            lezioni brevi collegate a dati di mercato reali.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="group flex min-h-touch-target animate-fade-in-up items-center gap-2 rounded-card bg-accent-purple px-6 text-base font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 hover:shadow-lg hover:shadow-accent-purple/30"
          style={{ animationDelay: "180ms" }}
        >
          Inizia
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 ease-in-out group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {FEATURES.map(({ Icon, title, description }, index) => (
          <div
            key={title}
            className="animate-fade-in-up rounded-card border border-bg-sidebar bg-bg-card p-5 text-left transition duration-150 ease-in-out hover:-translate-y-0.5 hover:border-accent-purple/40"
            style={{ animationDelay: `${240 + index * 80}ms` }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-card bg-accent-purple/15 text-accent-purple">
              <Icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-sm font-bold text-text-primary">{title}</p>
            <p className="mt-1 text-xs text-text-secondary">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
