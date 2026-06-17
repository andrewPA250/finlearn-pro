export const PORTFOLIO_STORAGE_KEY = "financehub:portfolio";
export const PORTFOLIO_MAX_HOLDINGS = 100;

export interface PortfolioHolding {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  notes?: string;
  addedAt: string;
}
