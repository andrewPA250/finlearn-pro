import type { MarketCategoryId } from "@/types/markets";
import { getLearnReferences } from "@/lib/assetLearnReferences";

interface AssetLearnReferencesProps {
  category: MarketCategoryId;
}

export function AssetLearnReferences({ category }: AssetLearnReferencesProps) {
  const refs = getLearnReferences(category);

  return (
    <section className="rounded-card border border-bg-border/15 bg-bg-card/60 p-5">
      <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Learn</h2>
      <div className="space-y-2">
        {refs.map((ref) => (
          <div key={ref.title} className="rounded-md border border-bg-border/15 bg-bg-sidebar/30 p-3">
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
