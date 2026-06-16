import type { MarketCategoryId } from "@/types/markets";
import { getAssetProfile } from "@/lib/assetProfiles";

interface AssetAboutProps {
  symbol: string;
  category: MarketCategoryId;
}

export function AssetAbout({ symbol, category }: AssetAboutProps) {
  const profile = getAssetProfile(symbol, category);

  return (
    <section className="rounded-card border border-bg-sidebar bg-bg-card p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">About</h2>
      <p className="mt-3 text-sm leading-relaxed text-text-primary/80">{profile.description}</p>
    </section>
  );
}
