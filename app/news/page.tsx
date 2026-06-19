import { NewsView } from "@/components/news/NewsView";
import { getGlobalNews } from "@/lib/globalNews";

export const metadata = {
  title: "Market News",
  description: "Latest market headlines across stocks, crypto, macro and commodities.",
};

export default async function NewsPage() {
  const result = await getGlobalNews();

  return <NewsView news={result.news} />;
}
