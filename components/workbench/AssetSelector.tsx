"use client";

import type { AssetId } from "@/types/market";
import { ASSET_LABELS } from "@/lib/market";

const OPTIONS: AssetId[] = ["sp500", "gold", "us10y"];

interface AssetSelectorProps {
  value: AssetId;
  onChange: (asset: AssetId) => void;
}

/** Dropdown: S&P 500 / Oro / US Treasury 10Y (sez. 4 spec). */
export function AssetSelector({ value, onChange }: AssetSelectorProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-secondary">
      Asset
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as AssetId)}
        className="h-touch-target rounded-card border border-bg-sidebar bg-bg-card px-3 text-sm text-text-primary transition duration-150 ease-in-out"
      >
        {OPTIONS.map((id) => (
          <option key={id} value={id}>
            {ASSET_LABELS[id]}
          </option>
        ))}
      </select>
    </label>
  );
}
