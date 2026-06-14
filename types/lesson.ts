import type { AssetId, OverlayId } from "./market";

export interface LessonMeta {
  id: number;
  title: string;
  keyConcept: string;
  chartAssets: AssetId[];
  defaultOverlays: OverlayId[];
}
