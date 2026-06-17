export const ALERTS_STORAGE_KEY = "financehub:alerts";
export const ALERTS_MAX = 50;

export type AlertType =
  | "price_above"
  | "price_below"
  | "change_above"
  | "change_below";

export type AlertStatus = "active" | "triggered" | "disabled";

export interface PriceAlert {
  id: string;
  symbol: string;
  type: AlertType;
  target: number;
  note?: string;
  enabled: boolean;
  /** Becomes "triggered" once condition is first met; resets to "active" if re-enabled. */
  triggeredAt?: string;
  createdAt: string;
}

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  price_above: "Price above",
  price_below: "Price below",
  change_above: "Daily % above",
  change_below: "Daily % below",
};
