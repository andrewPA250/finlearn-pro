import { getAssetQuote } from "@/lib/providers";
import type { TickerQuote } from "@/lib/market/ticker";
import { quoteFromProvider } from "@/lib/market/ticker";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");

    if (!symbolsParam) {
      return Response.json({});
    }

    const symbols = symbolsParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (symbols.length === 0) {
      return Response.json({});
    }

    // Fetch all quotes in parallel
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const providerQuote = await getAssetQuote(symbol);
        return {
          symbol,
          quote: providerQuote ? quoteFromProvider(providerQuote) : null,
        };
      })
    );

    // Build response map
    const quoteMap: Record<string, TickerQuote> = {};
    for (const result of results) {
      if (result.quote) {
        quoteMap[result.symbol] = result.quote;
      }
    }

    return Response.json(quoteMap);
  } catch {
    return Response.json({}, { status: 500 });
  }
}
