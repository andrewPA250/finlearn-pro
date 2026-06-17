import { PORTFOLIO_STORAGE_KEY, PORTFOLIO_MAX_HOLDINGS } from "./types";
import type { PortfolioHolding } from "./types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadPortfolio(): PortfolioHolding[] {
  try {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (h): h is PortfolioHolding =>
        h &&
        typeof h === "object" &&
        typeof h.id === "string" &&
        typeof h.symbol === "string" &&
        typeof h.quantity === "number" &&
        typeof h.avgPrice === "number"
    );
  } catch {
    return [];
  }
}

function savePortfolio(holdings: PortfolioHolding[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(holdings));
  } catch {}
}

export function addHolding(
  symbol: string,
  quantity: number,
  avgPrice: number,
  notes?: string
): PortfolioHolding[] {
  const current = loadPortfolio();
  if (current.length >= PORTFOLIO_MAX_HOLDINGS) return current;
  const holding: PortfolioHolding = {
    id: generateId(),
    symbol: symbol.trim().toUpperCase(),
    quantity,
    avgPrice,
    notes: notes?.trim() || undefined,
    addedAt: new Date().toISOString(),
  };
  const updated = [...current, holding];
  savePortfolio(updated);
  return updated;
}

export function updateHolding(
  id: string,
  quantity: number,
  avgPrice: number,
  notes?: string
): PortfolioHolding[] {
  const current = loadPortfolio();
  const updated = current.map((h) =>
    h.id === id ? { ...h, quantity, avgPrice, notes: notes?.trim() || undefined } : h
  );
  savePortfolio(updated);
  return updated;
}

export function removeHolding(id: string): PortfolioHolding[] {
  const current = loadPortfolio();
  const updated = current.filter((h) => h.id !== id);
  savePortfolio(updated);
  return updated;
}

export function clearPortfolio(): void {
  savePortfolio([]);
}
