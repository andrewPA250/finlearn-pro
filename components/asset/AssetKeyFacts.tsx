import type { MarketCategoryId } from "@/types/markets";
import { getAssetFacts } from "@/lib/assetFacts";

interface AssetKeyFactsProps {
  symbol: string;
  category: MarketCategoryId;
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-[13px] text-text-secondary">{label}</span>
      <span className="text-right font-mono text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}

export function AssetKeyFacts({ symbol, category }: AssetKeyFactsProps) {
  const facts = getAssetFacts(symbol, category);

  return (
    <section className="rounded-card bg-bg-card/40 p-5">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-muted">Key Facts</h2>
      <div className="mt-1">
        {facts.map((fact) => (
          <FactRow key={fact.label} label={fact.label} value={fact.value} />
        ))}
      </div>
    </section>
  );
}
