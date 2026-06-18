import { NextResponse } from "next/server";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

interface FinnhubProfile {
  logo?: string;
  name?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol || symbol.length > 20) {
    return NextResponse.json({ logoUrl: null }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ logoUrl: null });
  }

  try {
    const url = `${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      return NextResponse.json({ logoUrl: null });
    }

    const data: FinnhubProfile = await res.json();
    const logoUrl = data.logo && data.logo.length > 0 ? data.logo : null;

    return NextResponse.json(
      { logoUrl },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch {
    return NextResponse.json({ logoUrl: null });
  }
}
