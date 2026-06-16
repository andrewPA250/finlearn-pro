import type { MarketCategoryId } from "@/types/markets";

export interface LearnReference {
  title: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Category-based learn topic mappings
// ---------------------------------------------------------------------------
const CATEGORY_REFERENCES: Record<MarketCategoryId, LearnReference[]> = {
  equity: [
    { title: "What is a Stock?", description: "How equities represent ownership in companies and how shareholders benefit from growth and dividends." },
    { title: "How to Read a Stock Quote", description: "Understanding price, change, volume and the key numbers shown on a stock detail page." },
    { title: "P/E Ratio Explained", description: "The price-to-earnings ratio as a valuation tool — what it tells you and its limitations." },
    { title: "Market Cap Categories", description: "Large-cap, mid-cap and small-cap stocks — how they differ in risk and return profile." },
  ],
  etf: [
    { title: "What is an ETF?", description: "Exchange-traded funds as a low-cost way to own a diversified basket of assets in a single trade." },
    { title: "Passive vs. Active Investing", description: "Index funds versus actively managed funds — performance, fees and when each makes sense." },
    { title: "Expense Ratios Matter", description: "How small annual fees compound over time and why low-cost ETFs have a structural advantage." },
    { title: "ETF vs. Mutual Fund", description: "Key structural differences between ETFs and mutual funds — intraday trading, tax efficiency and minimums." },
  ],
  index: [
    { title: "What is a Stock Index?", description: "How market indices are constructed, weighted and used as performance benchmarks." },
    { title: "Market-Cap vs. Price Weighting", description: "Why the S&P 500 and Nasdaq use market cap weighting while the Dow Jones uses price weighting." },
    { title: "Index Rebalancing", description: "How index providers add and remove companies, and what this means for ETFs that track them." },
    { title: "Benchmarking Your Portfolio", description: "Using indices like the S&P 500 as a standard to measure your own investment performance." },
  ],
  crypto: [
    { title: "What is Bitcoin?", description: "The world's first decentralized digital currency — how it works, who controls it and why it has value." },
    { title: "Proof of Work vs. Proof of Stake", description: "The two main consensus mechanisms that secure blockchain networks and their trade-offs." },
    { title: "Blockchain Fundamentals", description: "How distributed ledgers, cryptographic hashing and consensus create a tamper-resistant record." },
    { title: "Crypto Volatility & Risk", description: "Why cryptocurrency prices are more volatile than traditional assets and how to think about risk sizing." },
  ],
  forex: [
    { title: "How the Forex Market Works", description: "The world's largest and most liquid market — currency pairs, pips, spreads and who trades them." },
    { title: "Reading Currency Pairs", description: "Base and quote currencies, bid/ask spreads and how to interpret a EUR/USD price." },
    { title: "Central Banks and Currencies", description: "How interest rate decisions by the Fed, ECB and BoJ move currency exchange rates." },
    { title: "Safe-Haven Currencies", description: "Why the USD, JPY and CHF tend to strengthen during market stress and what drives safe-haven flows." },
  ],
  commodity: [
    { title: "Commodities as an Asset Class", description: "Why investors hold commodities — inflation hedging, diversification and their role in the global economy." },
    { title: "Gold as a Safe Haven", description: "Gold's historical role as a store of value and how it behaves during inflationary and recessionary periods." },
    { title: "How Commodity Futures Work", description: "Spot price vs. futures price, contango, backwardation and how futures contracts are used by producers and investors." },
    { title: "Oil Supply and Demand Dynamics", description: "OPEC+ production decisions, U.S. shale output and global demand as drivers of crude oil prices." },
  ],
  bond: [
    { title: "Bond Basics", description: "How bonds work — coupon, maturity, yield and why bond prices move inversely to interest rates." },
    { title: "The Yield Curve Explained", description: "What the spread between 2-year and 10-year Treasury yields tells us about economic expectations." },
    { title: "Why the 10-Year Yield Matters", description: "The 10-year Treasury as the global risk-free rate benchmark and its influence on mortgages, equities and credit." },
    { title: "Inflation and Fixed Income", description: "How inflation erodes the real return on bonds and why central bank policy is central to bond investing." },
  ],
};

export function getLearnReferences(category: MarketCategoryId): LearnReference[] {
  return CATEGORY_REFERENCES[category];
}
