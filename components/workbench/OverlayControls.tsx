"use client";

import type { OverlayId } from "@/types/market";

const OVERLAY_LABELS: Record<OverlayId, string> = {
  stdDev: "Deviazione standard mobile (30gg)",
  ma200: "Media mobile (200gg)",
};

const OVERLAY_IDS: OverlayId[] = ["stdDev", "ma200"];

interface OverlayControlsProps {
  overlays: Record<OverlayId, boolean>;
  onToggle: (id: OverlayId) => void;
}

/** 2 checkbox: Deviazione standard mobile / Media mobile 200gg (sez. 4 spec). */
export function OverlayControls({ overlays, onToggle }: OverlayControlsProps) {
  return (
    <div className="flex flex-col gap-2 text-xs text-text-secondary">
      Overlay
      <div className="flex flex-col gap-2 text-sm text-text-primary">
        {OVERLAY_IDS.map((id) => (
          <label key={id} className="flex min-h-touch-target items-center gap-2">
            <input
              type="checkbox"
              checked={overlays[id]}
              onChange={() => onToggle(id)}
              className="h-4 w-4 accent-accent-purple"
            />
            {OVERLAY_LABELS[id]}
          </label>
        ))}
      </div>
    </div>
  );
}
