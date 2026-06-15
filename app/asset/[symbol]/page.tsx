import { notFound } from "next/navigation";
import { getInstrumentQuote } from "@/lib/providers";
import { quoteFromProvider } from "@/lib/market/ticker";
import { MARKET_CATEGORIES, getInstrumentBySymbol } from "@/lib/markets/catalog";
import { AssetView } from "@/components/asset/AssetView";

/**
 * Asset page (Step 10.5, struttura estesa in Step 10.7, dati via provider
 * dal Step 12): route definitiva `/asset/[symbol]` per ogni strumento del
 * catalogo Markets (`MARKET_INSTRUMENTS`, fonte unica condivisa con
 * `/markets` e la Search). La quotazione arriva da `getInstrumentQuote`
 * (`lib/providers`): per gli strumenti `"live"` ritorna i dati reali, per
 * gli strumenti `"soon"` (nessun `assetId`) ritorna `null` e la pagina
 * mostra il placeholder elegante. Grafico/dati storici completi arriveranno
 * con un provider candele più ricco: questa pagina resta lo shell stabile in
 * cui inserirli (vedi `components/asset/`).
 */
export default function AssetPage({ params }: { params: { symbol: string } }) {
  const instrument = getInstrumentBySymbol(params.symbol);
  if (!instrument) notFound();

  const categoryLabel = MARKET_CATEGORIES.find((c) => c.id === instrument.category)?.label ?? instrument.category;

  const providerQuote = getInstrumentQuote(instrument);
  const quote = providerQuote ? quoteFromProvider(providerQuote) : null;

  return <AssetView instrument={instrument} categoryLabel={categoryLabel} quote={quote} />;
}
