export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan" />
        <span className="animate-pulse">Loading…</span>
      </div>
    </div>
  );
}
