import type { MarketCategoryId } from "@/types/markets";

export interface AssetFact {
  label: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Per-asset static facts
// ---------------------------------------------------------------------------
const ASSET_FACTS: Record<string, AssetFact[]> = {
  // Equities
  AAPL:  [{ label: "Sector", value: "Technology" }, { label: "Industry", value: "Consumer Electronics" }, { label: "Exchange", value: "NASDAQ" }, { label: "Country", value: "United States" }],
  MSFT:  [{ label: "Sector", value: "Technology" }, { label: "Industry", value: "Software – Infrastructure" }, { label: "Exchange", value: "NASDAQ" }, { label: "Country", value: "United States" }],
  NVDA:  [{ label: "Sector", value: "Technology" }, { label: "Industry", value: "Semiconductors" }, { label: "Exchange", value: "NASDAQ" }, { label: "Country", value: "United States" }],
  TSLA:  [{ label: "Sector", value: "Consumer Cyclical" }, { label: "Industry", value: "Electric Vehicles" }, { label: "Exchange", value: "NASDAQ" }, { label: "Country", value: "United States" }],
  AMZN:  [{ label: "Sector", value: "Consumer Cyclical" }, { label: "Industry", value: "Broadline Retail" }, { label: "Exchange", value: "NASDAQ" }, { label: "Country", value: "United States" }],
  GOOGL: [{ label: "Sector", value: "Communication Services" }, { label: "Industry", value: "Internet Content & Information" }, { label: "Exchange", value: "NASDAQ" }, { label: "Country", value: "United States" }],
  META:  [{ label: "Sector", value: "Communication Services" }, { label: "Industry", value: "Internet Content & Information" }, { label: "Exchange", value: "NASDAQ" }, { label: "Country", value: "United States" }],
  AMD:   [{ label: "Sector", value: "Technology" }, { label: "Industry", value: "Semiconductors" }, { label: "Exchange", value: "NASDAQ" }, { label: "Country", value: "United States" }],
  PLTR:  [{ label: "Sector", value: "Technology" }, { label: "Industry", value: "Software – Infrastructure" }, { label: "Exchange", value: "NYSE" }, { label: "Country", value: "United States" }],

  // ETFs
  SPY:  [{ label: "Benchmark", value: "S&P 500" }, { label: "Issuer", value: "State Street (SPDR)" }, { label: "Expense Ratio", value: "0.0945%" }, { label: "Asset Class", value: "Large-Cap Equity" }],
  QQQ:  [{ label: "Benchmark", value: "Nasdaq-100" }, { label: "Issuer", value: "Invesco" }, { label: "Expense Ratio", value: "0.20%" }, { label: "Asset Class", value: "Large-Cap Growth" }],
  VOO:  [{ label: "Benchmark", value: "S&P 500" }, { label: "Issuer", value: "Vanguard" }, { label: "Expense Ratio", value: "0.03%" }, { label: "Asset Class", value: "Large-Cap Equity" }],
  VTI:  [{ label: "Benchmark", value: "CRSP US Total Market" }, { label: "Issuer", value: "Vanguard" }, { label: "Expense Ratio", value: "0.03%" }, { label: "Asset Class", value: "Total Market Equity" }],
  SCHD: [{ label: "Benchmark", value: "Dow Jones US Dividend 100" }, { label: "Issuer", value: "Schwab" }, { label: "Expense Ratio", value: "0.06%" }, { label: "Asset Class", value: "Dividend Equity" }],
  AGG:  [{ label: "Benchmark", value: "Bloomberg US Aggregate Bond" }, { label: "Issuer", value: "iShares (BlackRock)" }, { label: "Expense Ratio", value: "0.03%" }, { label: "Asset Class", value: "Investment-Grade Bonds" }],
  BND:  [{ label: "Benchmark", value: "Bloomberg US Aggregate Float Adj." }, { label: "Issuer", value: "Vanguard" }, { label: "Expense Ratio", value: "0.03%" }, { label: "Asset Class", value: "Investment-Grade Bonds" }],

  // Indices
  SPX: [{ label: "Components", value: "~500 companies" }, { label: "Weighting", value: "Market capitalization" }, { label: "Rebalancing", value: "Quarterly" }, { label: "Base Date", value: "January 3, 1928" }],
  NDX: [{ label: "Components", value: "100 companies" }, { label: "Weighting", value: "Modified market cap" }, { label: "Rebalancing", value: "Quarterly" }, { label: "Base Date", value: "February 1, 1985" }],
  DJI: [{ label: "Components", value: "30 companies" }, { label: "Weighting", value: "Price-weighted" }, { label: "Rebalancing", value: "As needed" }, { label: "Base Date", value: "May 26, 1896" }],
  RUT: [{ label: "Components", value: "~2,000 companies" }, { label: "Weighting", value: "Market capitalization" }, { label: "Rebalancing", value: "Annually (June)" }, { label: "Base Date", value: "December 31, 1986" }],

  // Crypto
  BTCUSD: [{ label: "Network", value: "Bitcoin" }, { label: "Consensus", value: "Proof of Work (SHA-256)" }, { label: "Max Supply", value: "21,000,000 BTC" }, { label: "Launch Year", value: "2009" }],
  ETHUSD: [{ label: "Network", value: "Ethereum" }, { label: "Consensus", value: "Proof of Stake" }, { label: "Max Supply", value: "No hard cap" }, { label: "Launch Year", value: "2015" }],
  XRPUSD: [{ label: "Network", value: "XRP Ledger" }, { label: "Consensus", value: "Federated Byzantine Agreement" }, { label: "Max Supply", value: "100,000,000,000 XRP" }, { label: "Launch Year", value: "2012" }],
  ADAUSD: [{ label: "Network", value: "Cardano" }, { label: "Consensus", value: "Proof of Stake (Ouroboros)" }, { label: "Max Supply", value: "45,000,000,000 ADA" }, { label: "Launch Year", value: "2017" }],

  // Forex
  EURUSD: [{ label: "Base Currency", value: "Euro (EUR)" }, { label: "Quote Currency", value: "US Dollar (USD)" }, { label: "Central Banks", value: "ECB / Federal Reserve" }, { label: "Market", value: "OTC / Forex" }],
  GBPUSD: [{ label: "Base Currency", value: "British Pound (GBP)" }, { label: "Quote Currency", value: "US Dollar (USD)" }, { label: "Central Banks", value: "Bank of England / Federal Reserve" }, { label: "Market", value: "OTC / Forex" }],
  USDJPY: [{ label: "Base Currency", value: "US Dollar (USD)" }, { label: "Quote Currency", value: "Japanese Yen (JPY)" }, { label: "Central Banks", value: "Federal Reserve / Bank of Japan" }, { label: "Market", value: "OTC / Forex" }],

  // Commodities
  XAUUSD: [{ label: "Type", value: "Precious Metal" }, { label: "Exchange", value: "LBMA / COMEX" }, { label: "Unit", value: "Troy ounce (USD)" }, { label: "Main Uses", value: "Store of value, Jewelry, Electronics" }],
  XAGUSD: [{ label: "Type", value: "Precious Metal" }, { label: "Exchange", value: "COMEX / LBMA" }, { label: "Unit", value: "Troy ounce (USD)" }, { label: "Main Uses", value: "Industrial, Jewelry, Solar panels" }],
  WTI:    [{ label: "Type", value: "Crude Oil" }, { label: "Exchange", value: "NYMEX" }, { label: "Unit", value: "Barrel (USD)" }, { label: "Benchmark Region", value: "North America" }],
  NATGAS: [{ label: "Type", value: "Natural Gas" }, { label: "Exchange", value: "NYMEX" }, { label: "Unit", value: "MMBtu (USD)" }, { label: "Pricing Hub", value: "Henry Hub, Louisiana" }],

  // Bonds
  US10Y: [{ label: "Issuer", value: "U.S. Department of the Treasury" }, { label: "Tenor", value: "10 Years" }, { label: "Rate Type", value: "Fixed coupon" }, { label: "Risk", value: "Risk-free (sovereign)" }],
  US30Y: [{ label: "Issuer", value: "U.S. Department of the Treasury" }, { label: "Tenor", value: "30 Years" }, { label: "Rate Type", value: "Fixed coupon" }, { label: "Risk", value: "Risk-free (sovereign)" }],
  US02Y: [{ label: "Issuer", value: "U.S. Department of the Treasury" }, { label: "Tenor", value: "2 Years" }, { label: "Rate Type", value: "Fixed coupon" }, { label: "Risk", value: "Risk-free (sovereign)" }],
};

// ---------------------------------------------------------------------------
// Category-level fallback facts
// ---------------------------------------------------------------------------
const CATEGORY_FACTS: Record<MarketCategoryId, AssetFact[]> = {
  equity:    [{ label: "Asset Type", value: "Equity (Stock)" }, { label: "Market", value: "Public stock exchange" }],
  etf:       [{ label: "Asset Type", value: "Exchange-Traded Fund" }, { label: "Liquidity", value: "Intraday tradeable" }],
  index:     [{ label: "Asset Type", value: "Market Index" }, { label: "Note", value: "Not directly investable" }],
  crypto:    [{ label: "Asset Type", value: "Cryptocurrency" }, { label: "Market", value: "24/7 global crypto exchanges" }],
  forex:     [{ label: "Asset Type", value: "Currency Pair" }, { label: "Market", value: "OTC / Forex (24/5)" }],
  commodity: [{ label: "Asset Type", value: "Commodity" }, { label: "Market", value: "Futures exchange" }],
  bond:      [{ label: "Asset Type", value: "Government Bond Yield" }, { label: "Direction", value: "Yield rises when price falls" }],
};

export function getAssetFacts(symbol: string, category: MarketCategoryId): AssetFact[] {
  return ASSET_FACTS[symbol] ?? CATEGORY_FACTS[category];
}
