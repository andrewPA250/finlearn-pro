import type { AssetId, MarketDataPoint } from "@/types/market";
import { getLessonMeta } from "@/lib/lessons";
import { getAssetCandles } from "@/lib/providers";
import { WorkbenchView } from "@/components/workbench/WorkbenchView";
import { WorkbenchAccessGuard } from "@/components/progress/WorkbenchAccessGuard";

export default function WorkbenchPage({
  searchParams,
}: {
  searchParams: { lesson?: string };
}) {
  const lessonId = Number(searchParams.lesson);
  const validLessonId =
    Number.isInteger(lessonId) && lessonId >= 1 && lessonId <= 6 ? lessonId : undefined;
  const lessonMeta = validLessonId ? getLessonMeta(validLessonId) : undefined;

  const rawData: Record<AssetId, MarketDataPoint[]> = {
    sp500: getAssetCandles("sp500"),
    gold: getAssetCandles("gold"),
    us10y: getAssetCandles("us10y"),
  };

  const view = <WorkbenchView rawData={rawData} lessonMeta={lessonMeta} />;

  if (lessonMeta) {
    return <WorkbenchAccessGuard lessonId={lessonMeta.id}>{view}</WorkbenchAccessGuard>;
  }

  return view;
}
