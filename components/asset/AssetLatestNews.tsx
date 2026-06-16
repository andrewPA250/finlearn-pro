import type { NewsItem } from "@/lib/assetNews";

interface AssetLatestNewsProps {
  news: NewsItem[];
  assetName: string;
}

function formatAge(unixSeconds: number): string {
  const diffMs = Date.now() - unixSeconds * 1000;
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return "< 1h ago";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-md border border-transparent p-2 transition-colors duration-100 hover:border-bg-sidebar hover:bg-white/[0.025]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium leading-snug text-text-primary group-hover:text-accent-purple line-clamp-3">
          {item.headline}
        </p>
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt=""
            className="h-10 w-14 flex-shrink-0 rounded object-cover opacity-70"
            loading="lazy"
          />
        )}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-text-secondary/60">
        {item.source && <span className="font-medium">{item.source}</span>}
        {item.source && item.datetime > 0 && <span>·</span>}
        {item.datetime > 0 && <span>{formatAge(item.datetime)}</span>}
      </div>
    </a>
  );
}

export function AssetLatestNews({ news, assetName }: AssetLatestNewsProps) {
  return (
    <section className="rounded-card border border-bg-sidebar bg-bg-card p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">Latest News</h2>

      {news.length === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">
          No recent news available for {assetName}.
        </p>
      ) : (
        <div className="mt-2 space-y-1 divide-y divide-bg-sidebar/40">
          {news.map((item) => (
            <div key={item.id} className="pt-1 first:pt-0">
              <NewsCard item={item} />
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-[10px] text-text-secondary/40">News provided by Finnhub</p>
    </section>
  );
}
