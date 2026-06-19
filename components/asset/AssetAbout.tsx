import type { MarketCategoryId } from "@/types/markets";
import { getAssetProfile } from "@/lib/assetProfiles";

interface AssetAboutProps {
  symbol: string;
  category: MarketCategoryId;
}

export function AssetAbout({ symbol, category }: AssetAboutProps) {
  const profile = getAssetProfile(symbol, category);

  return (
    <section className="rounded-card bg-bg-card/40 p-5">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">About</h2>
      <p className="text-sm leading-relaxed text-text-primary/80">{profile.description}</p>
    </section>
  );
}
