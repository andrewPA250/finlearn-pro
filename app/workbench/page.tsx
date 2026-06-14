import fs from "fs";
import path from "path";
import type { AssetId, MarketDataPoint } from "@/types/market";
import { getLessonMeta } from "@/lib/lessons";
import { ASSET_FILE_NAMES } from "@/lib/market";
import { WorkbenchView } from "@/components/workbench/WorkbenchView";
import { WorkbenchAccessGuard } from "@/components/progress/WorkbenchAccessGuard";

const DATA_DIR = path.join(process.cwd(), "public", "data");

function readMarketData(fileName: string): MarketDataPoint[] {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, fileName), "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MarketDataPoint[]) : [];
  } catch {
    return [];
  }
}

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
    sp500: readMarketData(ASSET_FILE_NAMES.sp500),
    gold: readMarketData(ASSET_FILE_NAMES.gold),
    us10y: readMarketData(ASSET_FILE_NAMES.us10y),
  };

  const view = <WorkbenchView rawData={rawData} lessonMeta={lessonMeta} />;

  if (lessonMeta) {
    return <WorkbenchAccessGuard lessonId={lessonMeta.id}>{view}</WorkbenchAccessGuard>;
  }

  return view;
}
