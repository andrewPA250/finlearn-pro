import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryQuotes } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { isValidCategory, getCategoryLabel, getCategoryDescription, getAssetsByCategory } from "@/lib/markets/categoryHelpers";
import type { MarketCategoryId } from "@/types/markets";
import { CategoryView } from "@/components/markets/CategoryView";

interface CategoryPageProps {
  params: { category: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  if (!isValidCategory(params.category)) {
    return { title: "Not Found" };
  }

  const label = getCategoryLabel(params.category as MarketCategoryId);
  return {
    title: `${label} — FinanceHub Markets`,
    description: getCategoryDescription(params.category as MarketCategoryId),
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryId = params.category;

  // Validate category
  if (!isValidCategory(categoryId)) {
    notFound();
  }

  // Get instruments in this category
  const instruments = getAssetsByCategory(categoryId as MarketCategoryId);

  if (instruments.length === 0) {
    notFound();
  }

  // Fetch only this category's quotes (not all 600)
  const categoryQuotes = await getCategoryQuotes(categoryId);
  const quotesBySymbol = Object.fromEntries(
    categoryQuotes.map((q) => [q.symbol, quoteFromProvider(q)])
  );

  return (
    <CategoryView
      categoryId={categoryId as MarketCategoryId}
      instruments={instruments}
      quotesBySymbol={quotesBySymbol}
    />
  );
}
