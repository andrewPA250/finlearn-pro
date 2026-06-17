import type { CalendarData, EarningsEvent, IpoEvent } from "./types";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

function getApiKey(): string | null {
  return process.env.FINNHUB_API_KEY ?? null;
}

/** Return ISO date strings for the given range relative to today. */
export function getDateRange(range: "today" | "week" | "month"): { from: string; to: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  const to = new Date(now);

  if (range === "today") {
    to.setHours(23, 59, 59, 999);
  } else if (range === "week") {
    to.setDate(to.getDate() + 6);
  } else {
    to.setDate(to.getDate() + 30);
  }

  return { from: iso(from), to: iso(to) };
}

interface FinnhubEarningsResponse {
  earningsCalendar?: Array<{
    symbol: string;
    date: string;
    hour: string;
    quarter: number;
    year: number;
    epsEstimate: number | null;
    epsActual: number | null;
    revenueEstimate: number | null;
    revenueActual: number | null;
  }>;
}

interface FinnhubIpoResponse {
  ipoCalendar?: Array<{
    date: string;
    exchange: string;
    name: string;
    symbol: string;
    numberOfShares: number | null;
    price: string | null;
    status: string;
    totalSharesValue: number | null;
  }>;
}

async function fetchEarnings(from: string, to: string): Promise<EarningsEvent[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    const url = `${FINNHUB_BASE}/calendar/earnings?from=${from}&to=${to}&token=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data: FinnhubEarningsResponse = await res.json();
    if (!data.earningsCalendar?.length) return [];

    return data.earningsCalendar.map((e) => ({
      type: "earnings" as const,
      symbol: e.symbol,
      date: e.date,
      hour: e.hour ?? "",
      quarter: e.quarter,
      year: e.year,
      epsEstimate: e.epsEstimate ?? null,
      epsActual: e.epsActual ?? null,
      revenueEstimate: e.revenueEstimate ?? null,
      revenueActual: e.revenueActual ?? null,
    }));
  } catch (err) {
    console.warn("[CalendarProvider] Earnings fetch failed:", err);
    return [];
  }
}

async function fetchIpos(from: string, to: string): Promise<IpoEvent[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    const url = `${FINNHUB_BASE}/calendar/ipo?from=${from}&to=${to}&token=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data: FinnhubIpoResponse = await res.json();
    if (!data.ipoCalendar?.length) return [];

    return data.ipoCalendar.map((i) => ({
      type: "ipo" as const,
      date: i.date,
      exchange: i.exchange ?? "",
      name: i.name ?? "",
      symbol: i.symbol ?? "",
      numberOfShares: i.numberOfShares ?? null,
      price: i.price ?? null,
      status: i.status ?? "",
      totalSharesValue: i.totalSharesValue ?? null,
    }));
  } catch (err) {
    console.warn("[CalendarProvider] IPO fetch failed:", err);
    return [];
  }
}

export async function fetchCalendarData(
  range: "today" | "week" | "month"
): Promise<CalendarData> {
  const { from, to } = getDateRange(range);

  const [earnings, ipos] = await Promise.all([
    fetchEarnings(from, to),
    fetchIpos(from, to),
  ]);

  return {
    earnings,
    ipos,
    earningsAvailable: !!getApiKey(),
    iposAvailable: !!getApiKey(),
    fromDate: from,
    toDate: to,
  };
}
