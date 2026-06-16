import type { AssetId, MarketDataPoint } from "@/types/market";
import { getLessonMeta } from "@/lib/lessons";
import { getAssetCandles } from "@/lib/providers";
import { WorkbenchView } from "@/components/workbench/WorkbenchView";
import { WorkbenchAccessGuard } from "@/components/progress/WorkbenchAccessGuard";

export default async function WorkbenchPage({
  searchParams,
}: {
  searchParams: { lesson?: string };
}) {
  const lessonId = Number(searchParams.lesson);
  const validLessonId =
    Number.isInteger(lessonId) && lessonId >= 1 && lessonId <= 6 ? lessonId : undefined;
  const lessonMeta = validLessonId ? getLessonMeta(validLessonId) : undefined;

  // getAssetCandles accetta simboli catalogo ("SPX", "XAUUSD", "US10Y")
  const rawData: Record<AssetId, MarketDataPoint[]> = {
    sp500: await getAssetCandles("SPX"),
    gold: await getAssetCandles("XAUUSD"),
    us10y: await getAssetCandles("US10Y"),
  };

  const view = <WorkbenchView rawData={rawData} lessonMeta={lessonMeta} />;

  if (lessonMeta) {
    return <WorkbenchAccessGuard lessonId={lessonMeta.id}>{view}</WorkbenchAccessGuard>;
  }

  return view;
}
