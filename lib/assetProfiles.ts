import type { MarketCategoryId } from "@/types/markets";

export interface AssetProfile {
  description: string;
}

// ---------------------------------------------------------------------------
// Curated profiles for key catalog assets
// ---------------------------------------------------------------------------
const ASSET_PROFILES: Record<string, AssetProfile> = {
  // Equities
  AAPL: {
    description:
      "Apple Inc. designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories. The iPhone remains its flagship product, complemented by the Mac, iPad, Apple Watch and a growing Services segment including the App Store, Apple Music and iCloud. Apple is one of the world's largest companies by market capitalization.",
  },
  MSFT: {
    description:
      "Microsoft Corporation develops and licenses software, services, devices and solutions globally. Its core businesses include the Azure cloud platform, Microsoft 365 productivity suite, Windows, Xbox gaming and LinkedIn. Microsoft has been a pioneer in enterprise software and is a leading force in AI through its partnership with OpenAI.",
  },
  NVDA: {
    description:
      "NVIDIA Corporation designs graphics processing units (GPUs) and system-on-chip units for gaming, professional visualization, data center and automotive markets. Its GPUs have become the dominant hardware for AI model training and inference, driving substantial demand across hyperscalers and research institutions.",
  },
  TSLA: {
    description:
      "Tesla Inc. designs, develops, manufactures and sells electric vehicles, energy storage systems and solar products. The Model 3, Model Y, Model S and Model X form its vehicle lineup. Tesla operates a global Supercharger network and is also developing autonomous driving technology and humanoid robotics.",
  },
  AMZN: {
    description:
      "Amazon.com Inc. operates as a technology and e-commerce company across three primary segments: North America e-commerce, International e-commerce and Amazon Web Services (AWS). AWS is the world's largest cloud computing platform. Amazon also operates Prime Video, Alexa and an expanding logistics network.",
  },
  GOOGL: {
    description:
      "Alphabet Inc. is the parent company of Google, the world's most used search engine and digital advertising platform. Google Cloud is its rapidly growing infrastructure business. Other bets include Waymo (autonomous driving), DeepMind (AI research) and Verily (life sciences).",
  },
  META: {
    description:
      "Meta Platforms Inc. owns and operates Facebook, Instagram, WhatsApp and Threads — platforms used by approximately three billion people daily. The company derives revenue primarily from digital advertising and is also investing heavily in augmented and virtual reality through its Reality Labs division.",
  },
  AMD: {
    description:
      "Advanced Micro Devices Inc. designs and sells CPUs, GPUs, FPGAs and adaptive SoCs for computing, graphics and embedded applications. AMD's EPYC server CPUs and Instinct GPUs compete directly with Intel and NVIDIA. Its acquisition of Xilinx expanded its presence in data center and embedded markets.",
  },
  PLTR: {
    description:
      "Palantir Technologies Inc. develops data analytics platforms used by government agencies and large enterprises. Its core products — Gotham, Foundry and AIP — integrate and analyze large datasets to support decision-making. Palantir has expanded into commercial AI applications across multiple industries.",
  },

  // ETFs
  SPY: {
    description:
      "The SPDR S&P 500 ETF Trust seeks to replicate the performance of the S&P 500 Index. Launched in 1993, it is the oldest and most actively traded ETF in the world. SPY holds approximately 500 large-cap U.S. equities weighted by market capitalization.",
  },
  QQQ: {
    description:
      "The Invesco QQQ Trust tracks the Nasdaq-100 Index, which includes the 100 largest non-financial companies listed on the Nasdaq Stock Market. The fund is heavily weighted toward technology and growth companies and is widely used as a proxy for the U.S. tech sector.",
  },
  VOO: {
    description:
      "The Vanguard S&P 500 ETF seeks to track the performance of the S&P 500 Index. With an extremely low expense ratio, VOO is one of the most popular vehicles for passive long-term equity investing and is managed by Vanguard, the firm that pioneered index fund investing.",
  },
  VTI: {
    description:
      "The Vanguard Total Stock Market ETF seeks to track the CRSP US Total Market Index, providing exposure to the entire U.S. equity market — including small-, mid- and large-cap stocks. VTI holds over 3,600 securities and offers broader diversification than an S&P 500 fund.",
  },
  SCHD: {
    description:
      "The Schwab US Dividend Equity ETF tracks the Dow Jones U.S. Dividend 100 Index, selecting 100 high-dividend-yielding U.S. stocks screened for financial strength and consistent dividend growth. SCHD is popular among income-oriented investors seeking dividend quality over high yield.",
  },
  AGG: {
    description:
      "The iShares Core U.S. Aggregate Bond ETF tracks the Bloomberg U.S. Aggregate Bond Index, the primary benchmark for the U.S. investment-grade bond market. AGG holds thousands of government, corporate, and mortgage-backed securities and is commonly used as a core fixed income allocation.",
  },
  BND: {
    description:
      "The Vanguard Total Bond Market ETF seeks to track the Bloomberg U.S. Aggregate Float Adjusted Index, providing broad exposure to U.S. investment-grade bonds. BND holds over 10,000 bonds across government, corporate and securitized debt, making it one of the most comprehensive bond ETFs available.",
  },

  // Indices
  SPX: {
    description:
      "The S&P 500 is a market-capitalization-weighted index of 500 of the largest publicly traded U.S. companies. It is widely considered the primary benchmark for U.S. large-cap equities and the most important gauge of the American stock market. Major sectors include technology, healthcare, financials and consumer discretionary.",
  },
  NDX: {
    description:
      "The Nasdaq-100 tracks the 100 largest non-financial companies listed on the Nasdaq Stock Market, selected based on market capitalization. It has a heavy weighting toward technology and growth-oriented companies, making it more volatile but also more growth-sensitive than the broader S&P 500.",
  },
  DJI: {
    description:
      "The Dow Jones Industrial Average is one of the oldest and most widely quoted stock market indices, tracking 30 large U.S. companies selected by the editors of The Wall Street Journal. Unlike most major indices, it is price-weighted rather than market-cap-weighted.",
  },
  RUT: {
    description:
      "The Russell 2000 is a stock market index tracking approximately 2,000 small-capitalization U.S. companies. It is the primary benchmark for U.S. small-cap equity performance and is often used as an indicator of domestic economic health, as small-caps tend to be more exposed to the U.S. economy.",
  },

  // Crypto
  BTCUSD: {
    description:
      "Bitcoin is a decentralized digital currency created in 2009 by the pseudonymous Satoshi Nakamoto. It operates on a peer-to-peer network using a proof-of-work consensus mechanism and is secured by the SHA-256 cryptographic algorithm. Bitcoin has a fixed maximum supply of 21 million coins.",
  },
  ETHUSD: {
    description:
      "Ethereum is an open-source blockchain platform that enables developers to build and deploy decentralized applications (dApps) and smart contracts. Launched in 2015, Ethereum transitioned to a proof-of-stake consensus mechanism in 2022 (The Merge), significantly reducing its energy consumption.",
  },
  XRPUSD: {
    description:
      "XRP is a digital asset created by Ripple Labs designed for fast, low-cost international payment settlements. Unlike Bitcoin and Ethereum, XRP does not rely on mining and all coins were pre-mined at inception. Ripple's xRapid product uses XRP as a bridge currency for cross-border transactions.",
  },
  ADAUSD: {
    description:
      "Cardano is a proof-of-stake blockchain platform founded by Ethereum co-founder Charles Hoskinson. Its development is guided by peer-reviewed academic research and formal verification methods. Cardano uses the Ouroboros consensus protocol and supports smart contracts through its Plutus programming language.",
  },

  // Forex
  EURUSD: {
    description:
      "EUR/USD is the most traded currency pair in the world, representing the exchange rate between the euro and the U.S. dollar. It reflects the relative economic performance of the Eurozone versus the United States. Major drivers include ECB and Federal Reserve monetary policy, inflation data and economic growth indicators.",
  },
  GBPUSD: {
    description:
      "GBP/USD, commonly known as Cable, represents the exchange rate between the British pound sterling and the U.S. dollar. The pair is sensitive to Bank of England monetary policy, UK economic data and geopolitical developments. It is the third most traded currency pair in the world.",
  },
  USDJPY: {
    description:
      "USD/JPY tracks the exchange rate between the U.S. dollar and the Japanese yen. Japan's yen is traditionally considered a safe-haven currency. The pair is highly sensitive to Bank of Japan monetary policy, U.S. Federal Reserve decisions and global risk sentiment.",
  },

  // Commodities
  XAUUSD: {
    description:
      "Gold is a precious metal traded globally as both a commodity and a financial asset. It has been used as a store of value and medium of exchange for millennia. Gold is widely held as a hedge against inflation, currency debasement and geopolitical risk. The London Bullion Market Association sets the daily benchmark price.",
  },
  XAGUSD: {
    description:
      "Silver is a precious metal with significant industrial applications in electronics, solar panels and medical devices, in addition to its role as a monetary metal and store of value. Silver is more volatile than gold and tends to outperform gold in risk-on environments.",
  },
  WTI: {
    description:
      "West Texas Intermediate (WTI) is a grade of light, sweet crude oil and the primary oil price benchmark for North American crude. WTI prices are influenced by OPEC+ production decisions, U.S. inventory data, geopolitical events and global demand dynamics. It is traded on the NYMEX.",
  },
  NATGAS: {
    description:
      "Natural gas is a fossil fuel used primarily for electricity generation, heating and industrial processes. Henry Hub in Louisiana serves as the pricing point for U.S. natural gas futures. Prices are highly seasonal and sensitive to weather patterns, storage levels and LNG export dynamics.",
  },

  // Bonds
  US10Y: {
    description:
      "The U.S. 10-Year Treasury yield is the interest rate on 10-year U.S. government bonds. It serves as the global risk-free rate benchmark and influences mortgage rates, corporate bond spreads and equity valuations. The yield reflects market expectations for inflation and Federal Reserve monetary policy over a decade.",
  },
  US30Y: {
    description:
      "The U.S. 30-Year Treasury yield represents the return on the longest-dated U.S. government bond. It is particularly sensitive to long-term inflation expectations and fiscal outlook. The 30-year Treasury is widely used to price long-duration fixed income assets such as mortgage-backed securities.",
  },
  US02Y: {
    description:
      "The U.S. 2-Year Treasury yield is the interest rate on short-term U.S. government debt. It is highly sensitive to Federal Reserve interest rate decisions and near-term monetary policy expectations. The spread between 2-year and 10-year yields (the yield curve) is a widely watched economic indicator.",
  },
};

// ---------------------------------------------------------------------------
// Category-level fallback descriptions
// ---------------------------------------------------------------------------
const CATEGORY_PROFILES: Record<MarketCategoryId, AssetProfile> = {
  equity: {
    description:
      "This is a publicly traded equity security representing ownership in a company. Shareholders may benefit from price appreciation and dividend distributions. Equity prices reflect expectations about future earnings, growth and macroeconomic conditions.",
  },
  etf: {
    description:
      "This exchange-traded fund (ETF) is designed to track the performance of an index, sector, commodity or other asset class. ETFs trade on stock exchanges like equities and typically offer diversification at low cost.",
  },
  index: {
    description:
      "This is a financial index that measures the performance of a group of assets, typically representing a market segment or geographic region. Indices are used as benchmarks for investment performance and cannot be directly invested in, though ETFs and futures contracts track them closely.",
  },
  crypto: {
    description:
      "This is a cryptocurrency — a blockchain-based digital asset secured by cryptographic methods. Cryptocurrencies operate on decentralized networks and enable peer-to-peer transactions without intermediaries. They are subject to high price volatility and evolving regulatory frameworks.",
  },
  forex: {
    description:
      "This is a currency pair traded in the foreign exchange (forex) market, the world's largest and most liquid financial market. The price reflects the exchange rate between two currencies and is influenced by interest rate differentials, economic data and central bank policy.",
  },
  commodity: {
    description:
      "This is a commodity — a raw material or primary agricultural product that is standardized and traded on regulated exchanges. Commodity prices are driven by supply and demand dynamics, geopolitical factors, weather conditions and macroeconomic trends.",
  },
  bond: {
    description:
      "This is a government bond yield representing the annualized return on sovereign debt. Bond yields move inversely to prices and reflect market expectations for interest rates, inflation and economic growth. They are a key input in global financial markets as risk-free rate benchmarks.",
  },
};

export function getAssetProfile(symbol: string, category: MarketCategoryId): AssetProfile {
  return ASSET_PROFILES[symbol] ?? CATEGORY_PROFILES[category];
}
