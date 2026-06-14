interface KeyConceptCalloutProps {
  keyConcept: string;
}

/** Card evidenziata per il concetto chiave della lezione (`meta.keyConcept`). */
export function KeyConceptCallout({ keyConcept }: KeyConceptCalloutProps) {
  return (
    <div className="mt-6 rounded-card border border-accent-purple/40 bg-bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-accent-purple">
        Concetto chiave
      </p>
      <p className="mt-2 text-lg font-bold text-text-primary">{keyConcept}</p>
    </div>
  );
}
