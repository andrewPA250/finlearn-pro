import type { Metadata } from "next";
import { CompareView } from "@/components/analytics/CompareView";
import { getAssetCandles, getAssetQuote, getAssetFundamentals } from "@/lib/providers";
import { getInstrumentBySymbol } from "@/lib/markets/catalog";
import type { MarketDataPoint } from "@/types/market";
import type { ProviderQuote, ProviderFundamentals } from "@/lib/providers";
import type { MarketInstrument } from "@/types/markets";

export const metadata: Metadata = {
  title: "Compare Assets — FinanceHub",
  description: "Compare multiple assets side-by-side: performance, fundamentals, and risk metrics.",
};

export interface CompareAsset {
  instrument: MarketInstrument;
  quote: ProviderQuote | null;
  candles: MarketDataPoint[];
  fundamentals: ProviderFundamentals | null;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { symbols?: string };
}) {
  const rawSymbols = searchParams.symbols ?? "AAPL,MSFT";
  const symbols = rawSymbols
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 5);

  const resolved = symbols
    .map((s) => getInstrumentBySymbol(s))
    .filter((i): i is MarketInstrument => i != null);

  const instruments =
    resolved.length > 0
      ? resolved
      : ([getInstrumentBySymbol("AAPL"), getInstrumentBySymbol("MSFT")].filter(
          Boolean
        ) as MarketInstrument[]);

  const assets = await Promise.all(
    instruments.map(async (inst) => {
      const [quote, candles, fundamentals] = await Promise.all([
        getAssetQuote(inst.symbol),
        getAssetCandles(inst.symbol),
        getAssetFundamentals(inst.symbol, inst.category),
      ]);
      return { instrument: inst, quote, candles, fundamentals } as CompareAsset;
    })
  );

  return <CompareView assets={assets} />;
}
