import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ContextSidebar } from "@/components/sidebar/ContextSidebar";
import { MarketRibbon } from "@/components/market/MarketRibbon";
import { getRibbonQuotes } from "@/lib/markets/getRibbonQuotes";
import { Providers } from "@/app/Providers";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
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
        className={`${ibmPlexSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <Header />
          <MarketRibbon quotes={ribbonQuotes} />
          <div className="flex min-h-[calc(100vh-3.5rem)]">
            <ContextSidebar />
            <main className="min-h-[calc(100vh-3.5rem)] min-w-0 flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
