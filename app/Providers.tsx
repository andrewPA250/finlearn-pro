"use client";

import { ProgressProvider } from "@/lib/progress/ProgressContext";
import { SettingsProvider } from "@/lib/settings/SettingsContext";
import { WatchlistProvider } from "@/lib/watchlist/WatchlistContext";
import { PortfolioProvider } from "@/lib/portfolio/PortfolioContext";
import { AlertsProvider } from "@/lib/alerts/AlertsContext";
import { CurrencyProvider } from "@/lib/currency/CurrencyContext";
import { AvatarProvider } from "@/lib/avatar/AvatarContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <CurrencyProvider>
        <WatchlistProvider>
          <PortfolioProvider>
            <AlertsProvider>
              <ProgressProvider>
                <AvatarProvider>
                  {children}
                </AvatarProvider>
              </ProgressProvider>
            </AlertsProvider>
          </PortfolioProvider>
        </WatchlistProvider>
      </CurrencyProvider>
    </SettingsProvider>
  );
}
