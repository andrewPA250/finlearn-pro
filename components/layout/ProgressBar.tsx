interface ProgressBarProps {
  /** Percentuale di completamento, 0-100 */
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="h-1 w-full bg-bg-card">
      <div
        className="h-full bg-accent-purple transition-all duration-150 ease-in-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
