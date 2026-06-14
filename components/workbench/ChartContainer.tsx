"use client";

import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint, SeriesMeta } from "@/lib/market";
import { createChartTooltip } from "./ChartTooltip";

interface ChartContainerProps {
  points: ChartPoint[];
  series: SeriesMeta[];
}

/**
 * Grafico linea principale: asse X date, asse Y "index" (normalizzato base
 * 100) e/o asse Y "percent" (rendimenti, US Treasury 10Y / deviazione
 * standard) a destra, secondo le unità delle serie passate (sez. 4 spec).
 */
export function ChartContainer({ points, series }: ChartContainerProps) {
  const hasIndexAxis = series.some((item) => item.unit === "index");
  const hasPercentAxis = series.some((item) => item.unit === "percent");

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-card border border-bg-sidebar bg-bg-card p-4 sm:h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
          <XAxis dataKey="date" stroke="#8B8FA8" tick={{ fontSize: 12 }} minTickGap={48} />
          {hasIndexAxis && (
            <YAxis
              yAxisId="index"
              stroke="#8B8FA8"
              tick={{ fontSize: 12 }}
              domain={["auto", "auto"]}
              label={{ value: "Indice (base 100)", angle: -90, position: "insideLeft", fill: "#8B8FA8", fontSize: 12 }}
            />
          )}
          {hasPercentAxis && (
            <YAxis
              yAxisId="percent"
              orientation="right"
              stroke="#8B8FA8"
              tick={{ fontSize: 12 }}
              domain={["auto", "auto"]}
              label={{ value: "%", angle: 90, position: "insideRight", fill: "#8B8FA8", fontSize: 12 }}
            />
          )}
          <Tooltip content={createChartTooltip(series, points)} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#8B8FA8" }} />
          {series.map((item) => (
            <Line
              key={item.key}
              dataKey={item.key}
              yAxisId={item.unit === "index" ? "index" : "percent"}
              name={item.label}
              stroke={item.color}
              strokeWidth={item.key === "primary" || item.key === "secondary" ? 2 : 1.5}
              strokeDasharray={item.key === "ma200" ? "6 4" : item.key === "stdDev" ? "2 3" : undefined}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
