import { MARKET_INSTRUMENTS, MARKET_CATEGORIES } from "@/lib/markets/catalog";
import type { MarketCategoryId, MarketInstrument } from "@/types/markets";

const CATEGORY_DESCRIPTIONS: Record<MarketCategoryId, string> = {
  equity: "Global mega-cap stocks and leading companies",
  etf: "Exchange-traded funds across asset classes",
  index: "Major stock market indices",
  crypto: "Digital assets and cryptocurrencies",
  forex: "Foreign exchange currency pairs",
  commodity: "Precious metals, energy, and agricultural futures",
  bond: "Government bond yields and rates",
};

const CATEGORY_PREVIEW_LIMIT = 10;

export function getCategoryLabel(categoryId: MarketCategoryId): string {
  const category = MARKET_CATEGORIES.find((c) => c.id === categoryId);
  return category?.label ?? categoryId;
}

export function getCategoryDescription(categoryId: MarketCategoryId): string {
  return CATEGORY_DESCRIPTIONS[categoryId] ?? "";
}

export function getAssetsByCategory(categoryId: MarketCategoryId): MarketInstrument[] {
  return MARKET_INSTRUMENTS.filter((inst) => inst.category === categoryId);
}

export function getCategoryPreview(categoryId: MarketCategoryId): MarketInstrument[] {
  return getAssetsByCategory(categoryId).slice(0, CATEGORY_PREVIEW_LIMIT);
}

export function getCategoryCount(categoryId: MarketCategoryId): number {
  return getAssetsByCategory(categoryId).length;
}

export function getAllCategoryStats(): Record<MarketCategoryId, number> {
  const stats: Record<string, number> = {};
  for (const category of MARKET_CATEGORIES) {
    stats[category.id] = getCategoryCount(category.id);
  }
  return stats as Record<MarketCategoryId, number>;
}

export function isValidCategory(categoryId: unknown): categoryId is MarketCategoryId {
  return MARKET_CATEGORIES.some((c) => c.id === categoryId);
}
