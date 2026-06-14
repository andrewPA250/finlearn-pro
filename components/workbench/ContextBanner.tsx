interface ContextBannerProps {
  text: string;
}

/** Banner semplice in cima al workbench: una riga di testo contestuale alla lezione (sez. 4 spec). */
export function ContextBanner({ text }: ContextBannerProps) {
  return (
    <div className="rounded-card border border-accent-purple/30 bg-bg-card px-4 py-3 text-sm text-text-secondary">
      {text}
    </div>
  );
}
