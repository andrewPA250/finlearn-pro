"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MarketInstrument } from "@/types/markets";
import type { TickerQuote } from "@/lib/market/ticker";
import type { PriceAlert, AlertStatus } from "@/lib/alerts/types";
import { ALERT_TYPE_LABELS } from "@/lib/alerts/types";
import { useAlerts } from "@/lib/alerts/AlertsContext";
import { AddAlertModal } from "./AddAlertModal";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(value: number | null | undefined, decimals = 2): string {
  if (value == null || isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPrice(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  return "$" + fmt(value);
}

function fmtChange(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function getAlertStatus(alert: PriceAlert): AlertStatus {
  if (!alert.enabled) return "disabled";
  if (alert.triggeredAt) return "triggered";
  return "active";
}

function evaluateTrigger(
  alert: PriceAlert,
  quote: TickerQuote | undefined
): boolean {
  if (!alert.enabled || alert.triggeredAt) return false;
  if (!quote || quote.value <= 0) return false;

  switch (alert.type) {
    case "price_above":  return quote.value >= alert.target;
    case "price_below":  return quote.value <= alert.target;
    case "change_above": return quote.changePercent >= alert.target;
    case "change_below": return quote.changePercent <= alert.target;
  }
}

const STATUS_STYLES: Record<AlertStatus, string> = {
  active:    "bg-blue-500/10 text-blue-400",
  triggered: "bg-green-500/10 text-green-400",
  disabled:  "bg-bg-primary text-text-muted",
};

const STATUS_LABELS: Record<AlertStatus, string> = {
  active:    "Active",
  triggered: "Triggered",
  disabled:  "Disabled",
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface AlertsViewProps {
  instruments: MarketInstrument[];
  instrumentsBySymbol: Record<string, MarketInstrument>;
}

// ─── Main component ──────────────────────────────────────────────────────────

export function AlertsView({ instruments, instrumentsBySymbol }: AlertsViewProps) {
  const { alerts, isHydrated, addAlert, updateAlert, toggleAlert, markTriggered, removeAlert } =
    useAlerts();

  const [quotesBySymbol, setQuotesBySymbol] = useState<Record<string, TickerQuote>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);

  const fetchQuotes = useCallback(async (syms: string[]) => {
    if (syms.length === 0) return;
    setQuotesLoading(true);
    try {
      const res = await fetch(`/api/quotes?symbols=${syms.join(",")}`);
      if (res.ok) {
        const data = (await res.json()) as Record<string, TickerQuote>;
        setQuotesBySymbol(data);
        setLastRefreshed(new Date());
      }
    } catch {
      // degrade gracefully
    } finally {
      setQuotesLoading(false);
    }
  }, []);

  const symbolsKey = alerts.map((a) => a.symbol).join(",");

  useEffect(() => {
    if (!isHydrated || alerts.length === 0) return;
    const seen = new Set<string>();
    const unique = alerts
      .map((a) => a.symbol)
      .filter((s) => { if (seen.has(s)) return false; seen.add(s); return true; });
    fetchQuotes(unique);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, symbolsKey]);

  // Evaluate triggers whenever quotes arrive
  useEffect(() => {
    if (!isHydrated) return;
    for (const alert of alerts) {
      if (evaluateTrigger(alert, quotesBySymbol[alert.symbol])) {
        markTriggered(alert.id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotesBySymbol, isHydrated]);

  const rows = useMemo(() => {
    return alerts.map((alert) => ({
      alert,
      instrument: instrumentsBySymbol[alert.symbol] ?? null,
      quote: quotesBySymbol[alert.symbol] ?? null,
      status: getAlertStatus(alert),
    }));
  }, [alerts, instrumentsBySymbol, quotesBySymbol]);

  const counts = useMemo(() => ({
    active:    rows.filter((r) => r.status === "active").length,
    triggered: rows.filter((r) => r.status === "triggered").length,
    disabled:  rows.filter((r) => r.status === "disabled").length,
  }), [rows]);

  function openCreate() { setEditingAlert(null); setModalOpen(true); }
  function openEdit(alert: PriceAlert) { setEditingAlert(alert); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingAlert(null); }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-platform px-4 py-12 md:px-6">
        <div className="h-8 w-32 animate-pulse rounded bg-bg-secondary" />
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-card bg-bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (alerts.length === 0) {
    return (
      <>
        <div className="mx-auto max-w-platform px-4 py-12 md:px-6">
          <div className="mb-6 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-text-primary">Alerts</h1>
            <p className="mt-0.5 text-sm text-text-secondary">
              Get notified when assets hit your price targets.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-card border border-border-base bg-bg-secondary px-6 py-16 text-center animate-fade-in-up" style={{ animationDelay: "40ms" }}>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan/10">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-cyan" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-text-primary">No alerts yet</h2>
            <p className="mb-6 max-w-sm text-sm text-text-secondary">
              Create price and change alerts for any of the 585+ assets in the catalog. You&apos;ll see when conditions are met right here.
            </p>
            <button
              onClick={openCreate}
              className="rounded-card bg-cyan px-5 py-2.5 text-sm font-semibold text-bg-primary hover:bg-cyan/90 transition"
            >
              + Create First Alert
            </button>
          </div>
        </div>
        {modalOpen && (
          <AddAlertModal
            instruments={instruments}
            editing={editingAlert}
            onSave={addAlert}
            onUpdate={updateAlert}
            onClose={closeModal}
          />
        )}
      </>
    );
  }

  // ── Full view ────────────────────────────────────────────────────────────
  return (
    <>
      <div className="mx-auto max-w-platform px-4 py-6 md:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Alerts</h1>
            <p className="mt-0.5 text-sm text-text-secondary">
              {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
              {lastRefreshed && (
                <span className="ml-2 text-text-muted">
                  · Checked {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const seen = new Set<string>();
                const unique = alerts
                  .map((a) => a.symbol)
                  .filter((s) => { if (seen.has(s)) return false; seen.add(s); return true; });
                fetchQuotes(unique);
              }}
              disabled={quotesLoading}
              className="rounded border border-border-base px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary transition disabled:opacity-50"
            >
              {quotesLoading ? "Checking…" : "↻ Check Now"}
            </button>
            <button
              onClick={openCreate}
              className="rounded bg-cyan px-4 py-1.5 text-sm font-semibold text-bg-primary hover:bg-cyan/90 transition"
            >
              + Add Alert
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
          <div className="rounded-card border border-border-base bg-bg-secondary p-4">
            <p className="text-xs text-text-secondary">Active</p>
            <p className="mt-1 text-xl font-bold text-blue-400">{counts.active}</p>
          </div>
          <div className="rounded-card border border-border-base bg-bg-secondary p-4">
            <p className="text-xs text-text-secondary">Triggered</p>
            <p className="mt-1 text-xl font-bold text-green-400">{counts.triggered}</p>
          </div>
          <div className="rounded-card border border-border-base bg-bg-secondary p-4">
            <p className="text-xs text-text-secondary">Disabled</p>
            <p className="mt-1 text-xl font-bold text-text-muted">{counts.disabled}</p>
          </div>
        </div>

        {/* Alerts table */}
        <div className="rounded-card border border-border-base bg-bg-secondary overflow-hidden animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border-base bg-bg-primary">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary whitespace-nowrap">Symbol</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary whitespace-nowrap hidden md:table-cell">Name</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary whitespace-nowrap">Price</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary whitespace-nowrap hidden sm:table-cell">Change %</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary whitespace-nowrap">Condition</th>
                  <th className="px-4 py-3 text-right font-semibold text-text-secondary whitespace-nowrap">Target</th>
                  <th className="px-4 py-3 text-center font-semibold text-text-secondary whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary whitespace-nowrap hidden lg:table-cell">Note</th>
                  <th className="px-4 py-3 text-center font-semibold text-text-secondary whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {rows.map(({ alert, instrument, quote, status }) => {
                  const isChangeType = alert.type === "change_above" || alert.type === "change_below";
                  return (
                    <tr key={alert.id} className={`hover:bg-bg-hover transition ${status === "triggered" ? "bg-green-500/5" : ""}`}>
                      <td className="px-4 py-3">
                        <Link href={`/asset/${alert.symbol}`} className="font-mono font-semibold text-cyan hover:underline">
                          {alert.symbol}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                        {instrument ? (
                          <Link href={`/asset/${alert.symbol}`} className="hover:text-text-primary hover:underline">
                            {instrument.name}
                          </Link>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {quotesLoading && !quote ? (
                          <span className="inline-block h-3 w-16 animate-pulse rounded bg-bg-primary" />
                        ) : (
                          <span className="text-text-primary">{quote ? fmtPrice(quote.value) : "—"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono hidden sm:table-cell">
                        {quote ? (
                          <span className={quote.changePercent >= 0 ? "text-green-500" : "text-red-500"}>
                            {fmtChange(quote.changePercent)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        {ALERT_TYPE_LABELS[alert.type]}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-text-primary whitespace-nowrap">
                        {isChangeType ? `${alert.target >= 0 ? "+" : ""}${fmt(alert.target)}%` : fmtPrice(alert.target)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
                          {STATUS_LABELS[status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs hidden lg:table-cell max-w-[120px] truncate">
                        {alert.note || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(alert)}
                            className="text-xs text-text-secondary hover:text-cyan transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleAlert(alert.id)}
                            className={`text-xs transition ${alert.enabled ? "text-text-muted hover:text-yellow-400" : "text-text-muted hover:text-blue-400"}`}
                          >
                            {alert.enabled ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => removeAlert(alert.id)}
                            className="text-xs text-text-muted hover:text-red-500 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-text-muted animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          Alerts are evaluated against delayed prices. Visual only — no push or email notifications.
        </p>
      </div>

      {modalOpen && (
        <AddAlertModal
          instruments={instruments}
          editing={editingAlert}
          onSave={addAlert}
          onUpdate={updateAlert}
          onClose={closeModal}
        />
      )}
    </>
  );
}
