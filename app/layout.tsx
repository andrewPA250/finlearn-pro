import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ContextSidebar } from "@/components/sidebar/ContextSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProgressProvider } from "@/lib/progress/ProgressContext";
import { SettingsProvider } from "@/lib/settings/SettingsContext";
import { WatchlistProvider } from "@/lib/watchlist/WatchlistContext";
import { MarketRibbon } from "@/components/market/MarketRibbon";
import { getRibbonQuotes } from "@/lib/markets/getRibbonQuotes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "FinanceHub",
  description:
    "FinanceHub — impara le basi degli investimenti, dell'inflazione e del rischio con il modulo Learn: lezioni brevi e dati di mercato reali.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ribbonQuotes = await getRibbonQuotes();

  return (
    <html lang="it">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <SettingsProvider>
          <WatchlistProvider>
            <ProgressProvider>
            <Header />
            <MarketRibbon quotes={ribbonQuotes} />
            <div className="flex min-h-[calc(100vh-3.5rem)]">
              <ContextSidebar />
              <main className="min-h-[calc(100vh-3.5rem)] min-w-0 flex-1 pb-touch-target md:pb-0">
                {children}
              </main>
            </div>
            <BottomNav />
          </ProgressProvider>
          </WatchlistProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
