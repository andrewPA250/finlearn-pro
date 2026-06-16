import type { ProviderQuote, QuoteProvider } from "./types";

/**
 * CoinGecko provider (Step 13.x): prezzi crypto via CoinGecko public API.
 *
 * - `source`: `"coingecko"`
 * - `freshness`: `"delayed"` — CoinGecko free tier aggiorna ogni ~1-2 min ma non
 *   garantisce latenza; con ISR `revalidate: 60` il dato mostrato può avere fino
 *   a ~2-3 minuti di ritardo rispetto al mercato. Non è streaming live.
 * - **Nessuna API key** — funziona con l'endpoint pubblico di CoinGecko.
 *   Se in futuro si aggiunge una demo/pro key, passarla nell'header
 *   `x-cg-demo-api-key` per sbloccare rate limit più alti.
 * - Una sola richiesta batch per tutti i simboli supportati (BTC + ETH):
 *   Next.js deduplication garantisce al massimo 1 fetch/60s per l'intera app.
 * - Ritorna `null` se il server risponde con errore o il prezzo è zero:
 *   **mai dati finti**.
 */

/** Mappa simbolo catalogo → CoinGecko coin ID. */
const COINGECKO_ID_MAP: Record<string, string> = {
  BTCUSD: "bitcoin",
  ETHUSD: "ethereum",
};

const COINGECKO_LABELS: Record<string, string> = {
  BTCUSD: "Bitcoin / USD",
  ETHUSD: "Ethereum / USD",
};

interface CoinGeckoResponse {
  [id: string]: {
    usd: number;
    usd_24h_change: number;
    last_updated_at: number;
  };
}

const ALL_IDS = Object.values(COINGECKO_ID_MAP).join(",");
const COINGECKO_URL =
  `https://api.coingecko.com/api/v3/simple/price` +
  `?ids=${ALL_IDS}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`;

class CoinGeckoProvider implements QuoteProvider {
  readonly source = "coingecko" as const;

  async getQuote(symbol: string): Promise<ProviderQuote | null> {
    const coinId = COINGECKO_ID_MAP[symbol];
    if (!coinId) return null;

    try {
      const res = await fetch(COINGECKO_URL, { next: { revalidate: 60 } });
      if (!res.ok) return null;

      const data: CoinGeckoResponse = await res.json();
      const coin = data[coinId];
      if (!coin || !coin.usd || coin.usd === 0) return null;

      const changePercent = coin.usd_24h_change ?? 0;
      // Calcola variazione assoluta da variazione% 24h
      const prev = coin.usd / (1 + changePercent / 100);
      const change = coin.usd - prev;
      const date = new Date(coin.last_updated_at * 1000).toISOString().slice(0, 10);

      return {
        symbol,
        label: COINGECKO_LABELS[symbol] ?? symbol,
        unit: "index",
        value: coin.usd,
        change,
        changePercent,
        date,
        freshness: "delayed",
        source: this.source,
      };
    } catch {
      return null;
    }
  }
}

export const coinGeckoProvider: QuoteProvider = new CoinGeckoProvider();

/**
 * Come aggiungere una nuova crypto CoinGecko:
 * 1. Aggiungere `SIMBOLO_CATALOGO: "coingecko-id"` a `COINGECKO_ID_MAP`
 *    (l'id si trova su coingecko.com/coins/<id>)
 * 2. Aggiungere la label a `COINGECKO_LABELS`
 * 3. In `lib/providers/index.ts`: aggiungere `SIMBOLO_CATALOGO: coinGeckoProvider` a `QUOTE_PROVIDERS`
 * 4. In `lib/markets/catalog.ts`: impostare `status: "delayed"` per lo strumento
 */
