import type { AssetUnit } from "@/lib/market";
import type { ProviderQuote, QuoteProvider } from "./types";

/**
 * Finnhub provider (Step 13): quotazioni ritardate via REST per azioni e ETF USA.
 *
 * - `source`: `"finnhub"`
 * - `freshness`: `"delayed"` (Finnhub free tier → 15 min di ritardo per azioni US)
 * - Caching: `{ next: { revalidate: 60 } }` — Next.js ISR-style, rinnova ogni
 *   60 secondi. Sicuro sul free tier (60 call/min): 10 asset × 1 call = 10
 *   richieste per page load, poi servite dalla cache fino al prossimo revalidate.
 * - **Server-only**: usa `process.env.FINNHUB_API_KEY` (mai NEXT_PUBLIC_*).
 *   Non espone la key al browser.
 * - Ritorna `null` se `c === 0` o `t === 0` (Finnhub restituisce zeri per
 *   simboli non coperti o mercati chiusi senza dato): **mai prezzi inventati**.
 *
 * Nota: crypto (BINANCE:BTCUSDT, BINANCE:ETHUSDT) e forex (OANDA:EUR_USD)
 * restituiscono "You don't have access to this resource" sul free tier.
 * Questi asset usano provider dedicati: CoinGecko e Frankfurter.
 */

/** Mappa simbolo catalogo → simbolo Finnhub API (solo azioni/ETF USA). */
const FINNHUB_SYMBOL_MAP: Record<string, string> = {
  AAPL: "AAPL",
  MSFT: "MSFT",
  NVDA: "NVDA",
  AMZN: "AMZN",
  GOOGL: "GOOGL",
  META: "META",
  TSLA: "TSLA",
  AMD: "AMD",
  SPY: "SPY",
  QQQ: "QQQ",
};

const FINNHUB_LABELS: Record<string, string> = {
  AAPL: "Apple",
  MSFT: "Microsoft",
  NVDA: "NVIDIA",
  AMZN: "Amazon",
  GOOGL: "Alphabet",
  META: "Meta",
  TSLA: "Tesla",
  AMD: "AMD",
  SPY: "SPDR S&P 500",
  QQQ: "Invesco QQQ",
};

const FINNHUB_UNITS: Record<string, AssetUnit> = {
  AAPL: "index",
  MSFT: "index",
  NVDA: "index",
  AMZN: "index",
  GOOGL: "index",
  META: "index",
  TSLA: "index",
  AMD: "index",
  SPY: "index",
  QQQ: "index",
};

interface FinnhubQuoteResponse {
  c: number;   // current price
  d: number;   // change
  dp: number;  // percent change
  t: number;   // unix timestamp of last trade
}

class FinnhubQuoteProvider implements QuoteProvider {
  readonly source = "finnhub" as const;

  async getQuote(symbol: string): Promise<ProviderQuote | null> {
    const apiKey = process.env.FINNHUB_API_KEY;
    const finnhubSymbol = FINNHUB_SYMBOL_MAP[symbol];
    if (!apiKey || !finnhubSymbol) return null;

    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhubSymbol)}&token=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) return null;

      const data: FinnhubQuoteResponse = await res.json();
      // c===0 o t===0 → Finnhub non ha dati per questo simbolo
      if (!data.c || data.c === 0 || data.t === 0) return null;

      const date = new Date(data.t * 1000).toISOString().slice(0, 10);
      return {
        symbol,
        label: FINNHUB_LABELS[symbol] ?? symbol,
        unit: FINNHUB_UNITS[symbol] ?? "index",
        value: data.c,
        change: data.d ?? 0,
        changePercent: data.dp ?? 0,
        date,
        freshness: "delayed",
        source: this.source,
      };
    } catch {
      return null;
    }
  }
}

export const finnhubProvider: QuoteProvider = new FinnhubQuoteProvider();

/**
 * Come aggiungere un nuovo asset Finnhub (azioni/ETF USA) in futuro:
 * 1. Aggiungere `SIMBOLO: "FINNHUB_API_SYMBOL"` a `FINNHUB_SYMBOL_MAP`
 * 2. Aggiungere label e unit a `FINNHUB_LABELS`/`FINNHUB_UNITS`
 * 3. In `lib/providers/index.ts`: aggiungere `SIMBOLO: finnhubProvider` a `QUOTE_PROVIDERS`
 * 4. In `lib/markets/catalog.ts`: impostare `status: "delayed"` per lo strumento
 *
 * Per crypto → usare `coinGeckoProvider.ts`.
 * Per forex → usare `frankfurterProvider.ts`.
 * Per upgrade a Live: sostituire questa implementazione con WebSocket Finnhub
 * (`wss://ws.finnhub.io?token=...`) mantenendo la stessa interfaccia `QuoteProvider`.
 */
