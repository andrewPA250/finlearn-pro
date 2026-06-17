import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllAssetQuotes } from "@/lib/providers";
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

  // Get all quotes and convert to TickerQuote
  const allQuotes = await getAllAssetQuotes();
  const quotesBySymbol = Object.fromEntries(
    allQuotes.map((q) => [q.symbol, quoteFromProvider(q)])
  );

  // Get all instruments in this category
  const instruments = getAssetsByCategory(categoryId as MarketCategoryId);

  if (instruments.length === 0) {
    notFound();
  }

  return (
    <CategoryView
      categoryId={categoryId as MarketCategoryId}
      instruments={instruments}
      quotesBySymbol={quotesBySymbol}
    />
  );
}
