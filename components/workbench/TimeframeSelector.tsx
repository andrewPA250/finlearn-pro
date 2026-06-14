"use client";

import type { Timeframe } from "@/types/market";
import { TIMEFRAMES } from "@/lib/market";

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (timeframe: Timeframe) => void;
}

/** Pill: 1Y · 5Y · 10Y (sez. 4 spec). */
export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex flex-col gap-1 text-xs text-text-secondary">
      Periodo
      <div className="flex gap-2">
        {TIMEFRAMES.map((timeframe) => {
          const active = timeframe === value;
          return (
            <button
              key={timeframe}
              type="button"
              onClick={() => onChange(timeframe)}
              aria-pressed={active}
              className={`h-touch-target rounded-card px-4 text-sm font-bold transition duration-150 ease-in-out ${
                active
                  ? "bg-accent-purple text-text-primary"
                  : "bg-bg-card text-text-secondary hover:text-text-primary"
              }`}
            >
              {timeframe}
            </button>
          );
        })}
      </div>
    </div>
  );
}
