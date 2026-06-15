import { SoonBadge } from "@/components/layout/SoonBadge";

interface AssetSectionPlaceholderProps {
  title: string;
  description: string;
}

/**
 * Card placeholder per le sezioni future della pagina asset (Chart, Stats,
 * News, Learn references): stesso stile delle sezioni reali (header + badge
 * "Soon" + testo), così la pagina appare intenzionale e non incompleta anche
 * prima che i contenuti siano disponibili.
 */
export function AssetSectionPlaceholder({ title, description }: AssetSectionPlaceholderProps) {
  return (
    <section className="rounded-card border border-bg-sidebar bg-bg-card p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">{title}</h2>
        <SoonBadge />
      </header>
      <p className="mt-2 max-w-reading text-sm text-text-secondary">{description}</p>
    </section>
  );
}
