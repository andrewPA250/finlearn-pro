import type { Metadata } from "next";
import { fetchCalendarData } from "@/lib/calendar/calendarProvider";
import { CalendarView } from "@/components/calendar/CalendarView";

export const metadata: Metadata = {
  title: "Calendar — FinanceHub",
  description: "Earnings, IPO, and economic calendar powered by real market data.",
};

// Revalidate every hour — calendar data doesn't change second-to-second
export const revalidate = 3600;

export default async function CalendarPage() {
  // Default: next 30 days gives the richest view
  const data = await fetchCalendarData("month");

  return <CalendarView data={data} />;
}
