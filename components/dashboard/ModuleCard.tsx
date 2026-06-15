import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/components/layout/icons";
import { SoonBadge } from "@/components/layout/SoonBadge";

interface ModuleCardCta {
  label: string;
  href: string;
}

interface ModuleCardProps {
  icon: ReactNode;
  iconClassName?: string;
  eyebrow: string;
  title: string;
  description: string;
  cta?: ModuleCardCta;
  soon?: boolean;
  children?: ReactNode;
}

/**
 * Card "modulo" generica per il command center della Home: icona, eyebrow,
 * titolo, descrizione, CTA opzionale o badge "Soon". Usata per Learn,
 * Workbench e Portfolio con lo stesso peso visivo.
 */
export function ModuleCard({
  icon,
  iconClassName = "bg-accent-purple/15 text-accent-purple",
  eyebrow,
  title,
  description,
  cta,
  soon,
  children,
}: ModuleCardProps) {
  return (
    <div
      className={`flex h-full flex-col rounded-card border border-bg-sidebar bg-bg-card p-5 transition duration-150 ease-in-out ${
        soon ? "" : "hover:-translate-y-0.5 hover:border-accent-purple/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-card ${iconClassName}`}>{icon}</div>
        {soon && <SoonBadge />}
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-text-secondary">{eyebrow}</p>
      <p className="mt-1 text-lg font-bold text-text-primary">{title}</p>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
      {children}
      {cta && (
        <Link
          href={cta.href}
          className="group mt-4 flex h-touch-target w-full items-center justify-center gap-2 rounded-card bg-accent-purple px-4 text-sm font-bold text-text-primary transition duration-150 ease-in-out hover:opacity-90 md:mt-auto md:w-auto"
        >
          {cta.label}
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 ease-in-out group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
