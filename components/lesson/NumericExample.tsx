interface NumericExampleProps {
  children: React.ReactNode;
}

/** Blocco dedicato per esempi pratici/numerici, in font monospace (JetBrains Mono). */
export function NumericExample({ children }: NumericExampleProps) {
  return (
    <div className="mt-6 rounded-card border border-accent-purple/30 bg-bg-card p-5 font-mono text-sm leading-relaxed text-text-primary">
      {children}
    </div>
  );
}
