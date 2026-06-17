import { ALERTS_STORAGE_KEY, ALERTS_MAX } from "./types";
import type { PriceAlert, AlertType } from "./types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadAlerts(): PriceAlert[] {
  try {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a): a is PriceAlert =>
        a &&
        typeof a === "object" &&
        typeof a.id === "string" &&
        typeof a.symbol === "string" &&
        typeof a.type === "string" &&
        typeof a.target === "number" &&
        typeof a.enabled === "boolean"
    );
  } catch {
    return [];
  }
}

function saveAlerts(alerts: PriceAlert[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch {}
}

export function addAlert(
  symbol: string,
  type: AlertType,
  target: number,
  note?: string
): PriceAlert[] {
  const current = loadAlerts();
  if (current.length >= ALERTS_MAX) return current;
  const alert: PriceAlert = {
    id: generateId(),
    symbol: symbol.trim().toUpperCase(),
    type,
    target,
    note: note?.trim() || undefined,
    enabled: true,
    createdAt: new Date().toISOString(),
  };
  const updated = [...current, alert];
  saveAlerts(updated);
  return updated;
}

export function updateAlert(
  id: string,
  type: AlertType,
  target: number,
  note?: string
): PriceAlert[] {
  const current = loadAlerts();
  const updated = current.map((a) =>
    a.id === id
      ? { ...a, type, target, note: note?.trim() || undefined, triggeredAt: undefined }
      : a
  );
  saveAlerts(updated);
  return updated;
}

export function toggleAlert(id: string): PriceAlert[] {
  const current = loadAlerts();
  const updated = current.map((a) =>
    a.id === id
      ? { ...a, enabled: !a.enabled, triggeredAt: a.enabled ? a.triggeredAt : undefined }
      : a
  );
  saveAlerts(updated);
  return updated;
}

export function markTriggered(id: string): PriceAlert[] {
  const current = loadAlerts();
  const updated = current.map((a) =>
    a.id === id && !a.triggeredAt
      ? { ...a, triggeredAt: new Date().toISOString() }
      : a
  );
  saveAlerts(updated);
  return updated;
}

export function removeAlert(id: string): PriceAlert[] {
  const current = loadAlerts();
  const updated = current.filter((a) => a.id !== id);
  saveAlerts(updated);
  return updated;
}

export function clearAlerts(): void {
  saveAlerts([]);
}
