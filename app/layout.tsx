import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ContextSidebar } from "@/components/sidebar/ContextSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MarketRibbon } from "@/components/market/MarketRibbon";
import { getRibbonQuotes } from "@/lib/markets/getRibbonQuotes";
import { Providers } from "@/app/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://financehub.app"),
  title: {
    default: "FinanceHub",
    template: "%s — FinanceHub",
  },
  description:
    "FinanceHub — real market data, professional analytics, and structured investing lessons. Track 600+ global assets across stocks, ETFs, crypto, forex, and more.",
  openGraph: {
    siteName: "FinanceHub",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ribbonQuotes = await getRibbonQuotes();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <Header />
          <MarketRibbon quotes={ribbonQuotes} />
          <div className="flex min-h-[calc(100vh-3.5rem)]">
            <ContextSidebar />
            <main className="min-h-[calc(100vh-3.5rem)] min-w-0 flex-1 pb-touch-target md:pb-0">
              {children}
            </main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
