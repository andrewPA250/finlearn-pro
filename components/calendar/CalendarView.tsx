"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CalendarData, CalendarFilter, EarningsEvent, IpoEvent } from "@/lib/calendar/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function fmtMoney(value: number | null | undefined, compact = false): string {
  if (value == null || isNaN(value)) return "—";
  if (compact && Math.abs(value) >= 1e9)
    return "$" + (value / 1e9).toFixed(2) + "B";
  if (compact && Math.abs(value) >= 1e6)
    return "$" + (value / 1e6).toFixed(1) + "M";
  return "$" + value.toFixed(2);
}

function fmtEps(v: number | null): string {
  if (v == null || isNaN(v)) return "—";
  const sign = v >= 0 ? "" : "";
  return sign + "$" + v.toFixed(2);
}

function hourLabel(h: string): string {
  if (h === "bmo") return "Pre-market";
  if (h === "amc") return "After-hours";
  return "—";
}

function ipoStatusClass(status: string): string {
  if (status === "priced") return "bg-positive/10 text-positive";
  if (status === "expected") return "bg-info/10 text-info";
  return "bg-bg-primary text-text-muted";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card bg-bg-card/40 px-6 py-10 text-center">
      <p className="text-sm text-text-muted">No {label} events in this date range.</p>
    </div>
  );
}

// ─── Earnings Table ──────────────────────────────────────────────────────────

function EarningsTable({ events }: { events: EarningsEvent[] }) {
  if (events.length === 0) return <EmptyCard label="earnings" />;

  return (
    <div className="rounded-card bg-bg-card/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-card/60">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Symbol</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden sm:table-cell">When</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden md:table-cell">Period</th>
              <th className="px-4 py-3 text-right font-semibold text-text-secondary">EPS Est.</th>
              <th className="px-4 py-3 text-right font-semibold text-text-secondary">EPS Act.</th>
              <th className="px-4 py-3 text-right font-semibold text-text-secondary hidden lg:table-cell">Rev Est.</th>
              <th className="px-4 py-3 text-right font-semibold text-text-secondary hidden lg:table-cell">Rev Act.</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={`${e.symbol}-${e.date}-${i}`} className="hover:bg-bg-hover transition">
                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap">{fmtDate(e.date)}</td>
                <td className="px-4 py-2.5">
                  <Link href={`/asset/${e.symbol}`} className="font-mono font-semibold text-cyan hover:underline" onClick={(ev) => ev.stopPropagation()}>
                    {e.symbol}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-text-secondary hidden sm:table-cell">{hourLabel(e.hour)}</td>
                <td className="px-4 py-2.5 text-text-muted hidden md:table-cell">
                  Q{e.quarter} {e.year}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary">{fmtEps(e.epsEstimate)}</td>
                <td className={`px-4 py-2.5 text-right font-mono ${e.epsActual != null ? (e.epsActual >= (e.epsEstimate ?? 0) ? "text-positive" : "text-negative") : "text-text-muted"}`}>
                  {fmtEps(e.epsActual)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary hidden lg:table-cell">{fmtMoney(e.revenueEstimate, true)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary hidden lg:table-cell">{fmtMoney(e.revenueActual, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── IPO Table ───────────────────────────────────────────────────────────────

function IpoTable({ events }: { events: IpoEvent[] }) {
  if (events.length === 0) return <EmptyCard label="IPO" />;

  return (
    <div className="rounded-card bg-bg-card/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-card/60">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Symbol</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Company</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden sm:table-cell">Exchange</th>
              <th className="px-4 py-3 text-right font-semibold text-text-secondary hidden md:table-cell">Price Range</th>
              <th className="px-4 py-3 text-right font-semibold text-text-secondary hidden lg:table-cell">Total Value</th>
              <th className="px-4 py-3 text-center font-semibold text-text-secondary">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={`${e.symbol}-${e.date}-${i}`} className="hover:bg-bg-hover transition">
                <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap">{fmtDate(e.date)}</td>
                <td className="px-4 py-2.5 font-mono font-semibold text-cyan">{e.symbol || "—"}</td>
                <td className="px-4 py-2.5 text-text-primary max-w-[180px] truncate">{e.name || "—"}</td>
                <td className="px-4 py-2.5 text-text-secondary hidden sm:table-cell">{e.exchange || "—"}</td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary hidden md:table-cell">
                  {e.price ? `$${e.price}` : "—"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-text-secondary hidden lg:table-cell">
                  {fmtMoney(e.totalSharesValue, true)}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${ipoStatusClass(e.status)}`}>
                    {e.status || "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface CalendarViewProps {
  data: CalendarData;
}

const FILTERS: { id: CalendarFilter; label: string }[] = [
  { id: "all",      label: "All" },
  { id: "earnings", label: "Earnings" },
  { id: "ipo",      label: "IPOs" },
];

export function CalendarView({ data }: CalendarViewProps) {
  const [filter, setFilter] = useState<CalendarFilter>("all");

  const totalEvents = data.earnings.length + data.ipos.length;

  const summary = useMemo(() => ({
    earnings: data.earnings.length,
    ipos: data.ipos.length,
  }), [data]);

  const showEarnings = filter === "all" || filter === "earnings";
  const showIpos     = filter === "all" || filter === "ipo";

  return (
    <div className="mx-auto max-w-platform px-4 py-6 md:px-6">
      {/* Header */}
      <div className="mb-4 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-text-primary">Calendar</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Earnings, IPOs, and market events — real data from Finnhub.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
        <div className="rounded-card bg-bg-card/40 p-3.5">
          <p className="text-xs text-text-secondary">Total Events</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{totalEvents}</p>
        </div>
        <div className="rounded-card bg-bg-card/40 p-3.5">
          <p className="text-xs text-text-secondary">Earnings</p>
          <p className="mt-1 text-2xl font-bold text-cyan">{summary.earnings}</p>
        </div>
        <div className="rounded-card bg-bg-card/40 p-3.5">
          <p className="text-xs text-text-secondary">IPOs</p>
          <p className="mt-1 text-2xl font-bold text-color-ai">{summary.ipos}</p>
        </div>
        <div className="rounded-card bg-bg-card/40 p-3.5">
          <p className="text-xs text-text-secondary">Date Range</p>
          <p className="mt-1 text-sm font-semibold text-text-primary truncate">
            {data.fromDate} – {data.toDate}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-card bg-bg-card/40 p-1 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`shrink-0 rounded px-4 py-2 text-sm font-medium transition ${
              filter === id
                ? "bg-cyan text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content sections */}
      <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        {showEarnings && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-cyan inline-block" />
              Earnings ({summary.earnings})
            </h2>
            <EarningsTable events={data.earnings} />
          </section>
        )}

        {showIpos && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-purple-400 inline-block" />
              IPOs ({summary.ipos})
            </h2>
            <IpoTable events={data.ipos} />
          </section>
        )}
      </div>

      <p className="mt-6 text-xs text-text-muted">
        Earnings and IPO data from Finnhub.
      </p>
    </div>
  );
}
