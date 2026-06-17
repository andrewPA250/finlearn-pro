import type { Metadata } from "next";
import { MARKET_INSTRUMENTS } from "@/lib/markets/catalog";
import { PortfolioView } from "@/components/portfolio/PortfolioView";

export const metadata: Metadata = {
  title: "Portfolio — FinanceHub",
  description: "Track your investments and monitor P/L, market value, and allocation in real time.",
};

export default function PortfolioPage() {
  const instrumentsBySymbol = Object.fromEntries(
    MARKET_INSTRUMENTS.map((i) => [i.symbol, i])
  );

  return (
    <PortfolioView
      instruments={MARKET_INSTRUMENTS}
      instrumentsBySymbol={instrumentsBySymbol}
    />
  );
}
