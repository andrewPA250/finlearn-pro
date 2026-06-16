import type { MarketDataPoint } from "@/types/market";
import type { ProviderQuote, ProviderCandles, QuoteProvider, CandleProvider } from "./types";

/**
 * Frankfurter provider (Step 13.x): tassi di cambio forex via Frankfurter.app
 * (dati BCE — Banca Centrale Europea).
 *
 * - `source`: `"frankfurter-ecb"`
 * - `freshness`: `"eod"` — BCE pubblica i tassi di riferimento una volta al
 *   giorno alle ~16:00 CET nei giorni lavorativi. Non è streaming live.
 * - **Nessuna API key** — endpoint pubblico gratuito (open source).
 * - Una sola coppia di richieste batch per tutti i simboli supportati:
 *   Next.js deduplication garantisce al massimo 2 fetch/3600s per l'intera app
 *   (`latest` + data di riferimento per calcolare la variazione).
 * - Variazione calcolata rispetto alla chiusura precedente (±3 giorni fa →
 *   Frankfurter restituisce automaticamente l'ultimo giorno lavorativo disponibile).
 * - Ritorna `null` se il server risponde con errore o il tasso è zero.
 *
 * Convenzioni tassi:
 * - EURUSD: 1 EUR = ? USD  →  1 / (rates.EUR da USD base)
 * - GBPUSD: 1 GBP = ? USD  →  1 / (rates.GBP da USD base)
 * - USDJPY: 1 USD = ? JPY  →  rates.JPY da USD base
 */

interface FrankfurterHistoryResponse {
  rates: Record<string, Record<string, number>>;
}

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

/** Config per simbolo: quale valuta richiedere e come convertire in valore convenzionale. */
const FOREX_CONFIG: Record<string, {
  label: string;
  /** Colonna da leggere nella risposta `from=USD`. */
  currency: string;
  /** Conversione da "quante unità per 1 USD" al prezzo convenzionale del pair. */
  compute: (rates: Record<string, number>) => number;
}> = {
  EURUSD: {
    label: "Euro / USD",
    currency: "EUR",
    compute: (r) => 1 / r.EUR,   // 1 EUR = 1/r.EUR USD
  },
  GBPUSD: {
    label: "GBP / USD",
    currency: "GBP",
    compute: (r) => 1 / r.GBP,   // 1 GBP = 1/r.GBP USD
  },
  USDJPY: {
    label: "USD / JPY",
    currency: "JPY",
    compute: (r) => r.JPY,        // 1 USD = r.JPY JPY
  },
};

const TO_CURRENCIES = Array.from(
  new Set(Object.values(FOREX_CONFIG).map((c) => c.currency))
).join(",");

const BASE_URL = "https://api.frankfurter.app";

/** Start date for historical series (deterministic URL → stable ISR cache key). */
const HISTORY_START = "2020-01-01";

class FrankfurterProvider implements QuoteProvider, CandleProvider {
  readonly source = "frankfurter-ecb" as const;

  async getCandles(symbol: string): Promise<ProviderCandles | null> {
    const config = FOREX_CONFIG[symbol];
    if (!config) return null;
    try {
      const url = `${BASE_URL}/${HISTORY_START}..?from=USD&to=${TO_CURRENCIES}`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) return null;
      const data: FrankfurterHistoryResponse = await res.json();
      if (!data.rates) return null;
      const points: MarketDataPoint[] = Object.entries(data.rates)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([date, rates]) => ({ date, value: config.compute(rates) }))
        .filter((p) => p.value > 0);
      if (points.length === 0) return null;
      return { symbol, points, freshness: "eod", source: this.source };
    } catch {
      return null;
    }
  }


  async getQuote(symbol: string): Promise<ProviderQuote | null> {
    const config = FOREX_CONFIG[symbol];
    if (!config) return null;

    try {
      // Data di riferimento per il calcolo della variazione:
      // 3 giorni fa → Frankfurter restituisce il giorno lavorativo più recente
      // disponibile su o prima di quella data (gestisce weekend/festività BCE).
      const refDate = new Date(Date.now() - 3 * 86_400_000)
        .toISOString()
        .slice(0, 10);

      const [latestRes, prevRes] = await Promise.all([
        fetch(`${BASE_URL}/latest?from=USD&to=${TO_CURRENCIES}`, {
          next: { revalidate: 3600 },
        }),
        fetch(`${BASE_URL}/${refDate}?from=USD&to=${TO_CURRENCIES}`, {
          next: { revalidate: 3600 },
        }),
      ]);

      if (!latestRes.ok) return null;
      const latest: FrankfurterResponse = await latestRes.json();
      if (!latest.rates) return null;

      const value = config.compute(latest.rates);
      if (!value || value === 0) return null;

      let change = 0;
      let changePercent = 0;

      if (prevRes.ok) {
        try {
          const prev: FrankfurterResponse = await prevRes.json();
          if (prev.rates) {
            const prevValue = config.compute(prev.rates);
            if (prevValue && prevValue !== 0) {
              change = value - prevValue;
              changePercent = (change / prevValue) * 100;
            }
          }
        } catch {
          // Variazione non disponibile: mostra solo il valore corrente
        }
      }

      return {
        symbol,
        label: config.label,
        unit: "index",
        value,
        change,
        changePercent,
        date: latest.date,
        freshness: "eod",
        source: this.source,
      };
    } catch {
      return null;
    }
  }
}

export const frankfurterProvider: QuoteProvider & CandleProvider = new FrankfurterProvider();

/**
 * Come aggiungere un nuovo pair forex Frankfurter:
 * 1. Aggiungere il simbolo a `FOREX_CONFIG` con label, currency e compute
 * 2. In `lib/providers/index.ts`: aggiungere `SIMBOLO: frankfurterProvider` a `QUOTE_PROVIDERS`
 * 3. In `lib/markets/catalog.ts`: impostare `status: "delayed"` per lo strumento
 *
 * Nota: Frankfurter/BCE supporta solo valute europee e principali.
 * Per coppie esotiche (es. USDTRY, USDMXN) servono provider diversi.
 */
