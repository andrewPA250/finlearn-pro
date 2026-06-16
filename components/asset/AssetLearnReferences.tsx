import type { MarketCategoryId } from "@/types/markets";
import { getLearnReferences } from "@/lib/assetLearnReferences";

interface AssetLearnReferencesProps {
  category: MarketCategoryId;
}

export function AssetLearnReferences({ category }: AssetLearnReferencesProps) {
  const refs = getLearnReferences(category);

  return (
    <section className="rounded-card border border-bg-sidebar bg-bg-card p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">Learn</h2>
      <div className="mt-3 space-y-3">
        {refs.map((ref) => (
          <div key={ref.title} className="rounded-md border border-bg-sidebar/60 p-3">
            <p className="text-xs font-semibold text-text-primary">{ref.title}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{ref.description}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-text-secondary/40">
        Full lessons available in the Learn module.
      </p>
    </section>
  );
}
