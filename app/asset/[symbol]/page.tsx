import { notFound } from "next/navigation";
import { getInstrumentQuote, getAssetCandles } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MARKET_CATEGORIES, getInstrumentBySymbol } from "@/lib/markets/catalog";
import { getAssetNews } from "@/lib/assetNews";
import { AssetView } from "@/components/asset/AssetView";

export default async function AssetPage({ params }: { params: { symbol: string } }) {
  const instrument = getInstrumentBySymbol(params.symbol);
  if (!instrument) notFound();

  const categoryLabel = MARKET_CATEGORIES.find((c) => c.id === instrument.category)?.label ?? instrument.category;

  const [providerQuote, candles, news] = await Promise.all([
    getInstrumentQuote(instrument),
    getAssetCandles(instrument.symbol),
    getAssetNews(instrument.symbol, instrument.finnhubSymbol, instrument.category),
  ]);
  const quote = providerQuote ? quoteFromProvider(providerQuote) : null;

  return (
    <AssetView
      instrument={instrument}
      categoryLabel={categoryLabel}
      quote={quote}
      candles={candles}
      news={news}
    />
  );
}
