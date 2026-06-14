"use client";

import { useMemo, useState } from "react";
import type { LessonMeta } from "@/types/lesson";
import type { AssetId, MarketDataPoint, OverlayId, Timeframe } from "@/types/market";
import {
  ASSET_LABELS,
  ASSET_UNITS,
  filterByTimeframe,
  forwardFillOnDates,
  hasSufficientData,
  movingAverage,
  normalizeBase100,
  rollingStdDev,
  sanitizeSeries,
  type ChartPoint,
  type SeriesMeta,
} from "@/lib/market";
import { CHART_CONTEXT } from "@/lib/chartContext";
import { ContextBanner } from "./ContextBanner";
import { AssetSelector } from "./AssetSelector";
import { TimeframeSelector } from "./TimeframeSelector";
import { OverlayControls } from "./OverlayControls";
import { ChartContainer } from "./ChartContainer";
import { LessonLink } from "./LessonLink";
import { EmptyState } from "./EmptyState";

const ALL_ASSETS: AssetId[] = ["sp500", "gold", "us10y"];

const SERIES_COLORS = {
  primary: "#6C63FF",
  secondary: "#00D4A8",
  ma200: "#8B8FA8",
  stdDev: "#FF6B6B",
} as const;

interface WorkbenchViewProps {
  rawData: Record<AssetId, MarketDataPoint[]>;
  lessonMeta?: LessonMeta;
}

export function WorkbenchView({ rawData, lessonMeta }: WorkbenchViewProps) {
  const sanitized = useMemo(() => {
    const result: Record<AssetId, MarketDataPoint[]> = { sp500: [], gold: [], us10y: [] };
    for (const asset of ALL_ASSETS) result[asset] = sanitizeSeries(rawData[asset] ?? []);
    return result;
  }, [rawData]);

  const defaultPrimary = lessonMeta?.chartAssets[0] ?? "sp500";
  const defaultSecondary = lessonMeta?.chartAssets[1];

  const [primaryAsset, setPrimaryAsset] = useState<AssetId>(defaultPrimary);
  const [timeframe, setTimeframe] = useState<Timeframe>("5Y");
  const [overlays, setOverlays] = useState<Record<OverlayId, boolean>>({
    stdDev: lessonMeta?.defaultOverlays.includes("stdDev") ?? false,
    ma200: lessonMeta?.defaultOverlays.includes("ma200") ?? false,
  });

  const secondaryAsset: AssetId | undefined =
    defaultSecondary && defaultSecondary !== primaryAsset ? defaultSecondary : undefined;

  const requiredAssets = useMemo(
    () => (secondaryAsset ? [primaryAsset, secondaryAsset] : [primaryAsset]),
    [primaryAsset, secondaryAsset]
  );

  const missingAssets = requiredAssets.filter(
    (asset) => !hasSufficientData(sanitized[asset], timeframe)
  );
  const sufficient = missingAssets.length === 0;

  const chart = useMemo(() => {
    if (!sufficient) return null;

    const primaryUnit = ASSET_UNITS[primaryAsset];
    const primaryFiltered = filterByTimeframe(sanitized[primaryAsset], timeframe);
    const dates = primaryFiltered.map((point) => point.date);

    let primaryScaled: MarketDataPoint[];
    let primaryScaleFactor = 1;
    if (primaryUnit === "index") {
      const base = primaryFiltered[0]?.value;
      primaryScaleFactor = base ? 100 / base : 1;
      primaryScaled = normalizeBase100(primaryFiltered);
    } else {
      primaryScaled = primaryFiltered;
    }
    const primaryLookup = new Map(primaryScaled.map((point) => [point.date, point.value]));

    let secondaryUnit: "index" | "percent" | undefined;
    let secondaryLookup: Map<string, number> | undefined;
    if (secondaryAsset) {
      secondaryUnit = ASSET_UNITS[secondaryAsset];
      const filled = forwardFillOnDates(dates, sanitized[secondaryAsset]);
      if (secondaryUnit === "index") {
        const baseDate = dates.find((date) => filled.has(date));
        const base = baseDate ? filled.get(baseDate) : undefined;
        const factor = base ? 100 / base : 1;
        secondaryLookup = new Map(
          Array.from(filled.entries()).map(([date, value]) => [date, value * factor])
        );
      } else {
        secondaryLookup = filled;
      }
    }

    let ma200Lookup: Map<string, number> | undefined;
    if (overlays.ma200) {
      const ma = movingAverage(sanitized[primaryAsset], 200);
      ma200Lookup = new Map(ma.map((point) => [point.date, point.value * primaryScaleFactor]));
    }

    let stdDevLookup: Map<string, number> | undefined;
    if (overlays.stdDev) {
      const std = rollingStdDev(sanitized[primaryAsset], 30);
      stdDevLookup = new Map(std.map((point) => [point.date, point.value]));
    }

    const points: ChartPoint[] = dates.map((date) => ({
      date,
      primary: primaryLookup.get(date),
      secondary: secondaryLookup?.get(date),
      ma200: ma200Lookup?.get(date),
      stdDev: stdDevLookup?.get(date),
    }));

    const seriesLabel = (asset: AssetId, unit: "index" | "percent") =>
      unit === "index"
        ? `${ASSET_LABELS[asset]} (indice base 100)`
        : `${ASSET_LABELS[asset]} (%, rendimento)`;

    const series: SeriesMeta[] = [
      { key: "primary", label: seriesLabel(primaryAsset, primaryUnit), unit: primaryUnit, color: SERIES_COLORS.primary },
    ];
    if (secondaryAsset && secondaryUnit) {
      series.push({
        key: "secondary",
        label: seriesLabel(secondaryAsset, secondaryUnit),
        unit: secondaryUnit,
        color: SERIES_COLORS.secondary,
      });
    }
    if (overlays.ma200) {
      series.push({ key: "ma200", label: "Media mobile (200gg)", unit: primaryUnit, color: SERIES_COLORS.ma200 });
    }
    if (overlays.stdDev) {
      series.push({
        key: "stdDev",
        label: "Deviazione standard mobile (30gg, %)",
        unit: "percent",
        color: SERIES_COLORS.stdDev,
      });
    }

    return { points, series };
  }, [sanitized, primaryAsset, secondaryAsset, timeframe, overlays, sufficient]);

  const toggleOverlay = (id: OverlayId) => {
    setOverlays((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold text-text-primary">Workbench</h1>

      {lessonMeta && <ContextBanner text={CHART_CONTEXT[lessonMeta.id]} />}

      {secondaryAsset && ASSET_UNITS[secondaryAsset] === "percent" && (
        <p className="text-xs text-text-secondary">
          Attenzione: {ASSET_LABELS[secondaryAsset]} è un rendimento percentuale (asse destro, %), non un
          prezzo — non è normalizzato a base 100 come {ASSET_LABELS[primaryAsset]}.
        </p>
      )}
      {ASSET_UNITS[primaryAsset] === "percent" && (
        <p className="text-xs text-text-secondary">
          Attenzione: {ASSET_LABELS[primaryAsset]} è un rendimento percentuale, non un prezzo — non è
          normalizzato a base 100.
        </p>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <AssetSelector value={primaryAsset} onChange={setPrimaryAsset} />
        <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        <OverlayControls overlays={overlays} onToggle={toggleOverlay} />
      </div>

      {sufficient && chart ? (
        <ChartContainer points={chart.points} series={chart.series} />
      ) : (
        <EmptyState missingAssets={missingAssets} />
      )}

      {lessonMeta && <LessonLink lessonId={lessonMeta.id} title={lessonMeta.title} />}
    </div>
  );
}
