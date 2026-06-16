import { notFound } from "next/navigation";
import { getInstrumentQuote, getAssetCandles, getAssetFundamentals } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MARKET_CATEGORIES, getInstrumentBySymbol } from "@/lib/markets/catalog";
import { getAssetNews } from "@/lib/assetNews";
import { AssetView } from "@/components/asset/AssetView";

export default async function AssetPage({ params }: { params: { symbol: string } }) {
  const instrument = getInstrumentBySymbol(params.symbol);
  if (!instrument) notFound();

  const categoryLabel = MARKET_CATEGORIES.find((c) => c.id === instrument.category)?.label ?? instrument.category;

  const [providerQuote, candles, newsResult, fundamentals] = await Promise.all([
    getInstrumentQuote(instrument),
    getAssetCandles(instrument.symbol),
    getAssetNews(instrument.symbol, instrument.finnhubSymbol, instrument.category),
    getAssetFundamentals(instrument.symbol, instrument.category),
  ]);
  const quote = providerQuote ? quoteFromProvider(providerQuote) : null;

  return (
    <AssetView
      instrument={instrument}
      categoryLabel={categoryLabel}
      quote={quote}
      candles={candles}
      newsResult={newsResult}
      fundamentals={fundamentals}
    />
  );
}
