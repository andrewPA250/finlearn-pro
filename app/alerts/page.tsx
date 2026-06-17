import type { Metadata } from "next";
import { MARKET_INSTRUMENTS } from "@/lib/markets/catalog";
import { AlertsView } from "@/components/alerts/AlertsView";

export const metadata: Metadata = {
  title: "Alerts — FinanceHub",
  description: "Set price and change alerts for any asset in the FinanceHub catalog.",
};

export default function AlertsPage() {
  const instrumentsBySymbol = Object.fromEntries(
    MARKET_INSTRUMENTS.map((i) => [i.symbol, i])
  );

  return (
    <AlertsView
      instruments={MARKET_INSTRUMENTS}
      instrumentsBySymbol={instrumentsBySymbol}
    />
  );
}
