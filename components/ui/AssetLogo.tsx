"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MarketCategoryId } from "@/types/markets";

// Category icons for non-equity fallbacks
const CATEGORY_ICONS: Record<MarketCategoryId, string> = {
  equity:    "S",
  etf:       "E",
  index:     "I",
  crypto:    "₿",
  forex:     "FX",
  commodity: "C",
  bond:      "B",
};

const CATEGORY_COLORS: Record<MarketCategoryId, string> = {
  equity:    "bg-blue-500/20 text-blue-300",
  etf:       "bg-purple-500/20 text-purple-300",
  index:     "bg-cyan/20 text-cyan",
  crypto:    "bg-orange-500/20 text-orange-300",
  forex:     "bg-yellow-500/20 text-yellow-300",
  commodity: "bg-amber-500/20 text-amber-300",
  bond:      "bg-green-500/20 text-green-300",
};

// Only fetch logos for these — Finnhub profile2 covers equity + ETF
const LOGO_ELIGIBLE_CATEGORIES: MarketCategoryId[] = ["equity", "etf"];

interface AssetLogoProps {
  symbol: string;
  name: string;
  category: MarketCategoryId;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { outer: "h-7 w-7",  text: "text-[9px]",  img: 28 },
  md: { outer: "h-9 w-9",  text: "text-[11px]", img: 36 },
  lg: { outer: "h-12 w-12", text: "text-sm",     img: 48 },
};

function InitialsBadge({
  symbol,
  category,
  sizeClass,
  textClass,
}: {
  symbol: string;
  category: MarketCategoryId;
  sizeClass: string;
  textClass: string;
}) {
  const colorClass = CATEGORY_COLORS[category] ?? "bg-bg-hover text-text-secondary";
  const label =
    LOGO_ELIGIBLE_CATEGORIES.includes(category)
      ? symbol.slice(0, 2).toUpperCase()
      : (CATEGORY_ICONS[category] ?? symbol.slice(0, 2).toUpperCase());

  return (
    <div
      className={`${sizeClass} ${colorClass} flex shrink-0 items-center justify-center rounded-full font-bold ${textClass}`}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

export function AssetLogo({ symbol, name, category, size = "md", className = "" }: AssetLogoProps) {
  const { outer, text, img } = SIZE_MAP[size];
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!LOGO_ELIGIBLE_CATEGORIES.includes(category)) {
      setFetched(true);
      return;
    }

    let cancelled = false;

    fetch(`/api/logo?symbol=${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((data: { logoUrl: string | null }) => {
        if (!cancelled) {
          setLogoUrl(data.logoUrl);
          setFetched(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetched(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, category]);

  if (!fetched) {
    // Placeholder while loading — same size as badge, neutral color
    return (
      <div
        className={`${outer} shrink-0 animate-pulse rounded-full bg-bg-hover ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (logoUrl && !failed) {
    return (
      <div className={`${outer} shrink-0 overflow-hidden rounded-full bg-white ${className}`}>
        <Image
          src={logoUrl}
          alt={name}
          width={img}
          height={img}
          unoptimized
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <InitialsBadge
      symbol={symbol}
      category={category}
      sizeClass={`${outer} shrink-0 ${className}`}
      textClass={text}
    />
  );
}
