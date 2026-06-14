import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProgressProvider } from "@/lib/progress/ProgressContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "FinLearn Pro",
  description:
    "Impara le basi degli investimenti, dell'inflazione e del rischio attraverso lezioni brevi e dati di mercato reali.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ProgressProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="min-h-screen flex-1 pb-touch-target md:pb-0">
              {children}
            </main>
          </div>
          <BottomNav />
        </ProgressProvider>
      </body>
    </html>
  );
}
