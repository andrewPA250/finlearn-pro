import type { DataFreshness } from "./types";

/**
 * Utility per la classificazione della freshness dei dati di mercato.
 *
 * Centralizza la logica di determinazione dello stato del dato (Near Live,
 * Delayed, Market Closed, EOD) in base alla fonte e al timestamp, senza
 * toccare la logica di fetch dei provider.
 */

// ---------------------------------------------------------------------------
// US Market Hours
// ---------------------------------------------------------------------------

/**
 * Stima se il mercato azionario USA (NYSE/NASDAQ) è attualmente aperto.
 *
 * Regole:
 * - Solo lunedì–venerdì (UTC weekday).
 * - Orari regolari: 09:30–16:00 ET.
 * - DST semplificato: EDT (UTC-4) ~10 Mar–3 Nov, EST (UTC-5) altrimenti.
 * - Festività USA: IGNORATE (come da spec).
 *
 * Non costruire un sistema exchange-hours complesso: questa funzione è
 * intenzionalmente un'approssimazione. Errori di ±1 ora intorno
 * alle transizioni DST sono accettabili.
 */
export function isUSMarketOpen(now: Date = new Date()): boolean {
  const utcDay = now.getUTCDay(); // 0 = Sun, 6 = Sat
  if (utcDay === 0 || utcDay === 6) return false;

  const month = now.getUTCMonth() + 1; // 1–12
  const dayOfMonth = now.getUTCDate();

  // DST approximation: EDT (UTC-4) dal ~10 Mar al ~3 Nov
  // (seconda domenica di marzo → prima domenica di novembre — semplificato)
  const isEDT =
    (month > 3 || (month === 3 && dayOfMonth >= 10)) &&
    (month < 11 || (month === 11 && dayOfMonth <= 3));

  // Apertura e chiusura in minuti UTC
  // EDT: 09:30 ET = 13:30 UTC | 16:00 ET = 20:00 UTC
  // EST: 09:30 ET = 14:30 UTC | 16:00 ET = 21:00 UTC
  const openUTC = isEDT ? 13 * 60 + 30 : 14 * 60 + 30;
  const closeUTC = isEDT ? 20 * 60 : 21 * 60;

  const nowUTC = now.getUTCHours() * 60 + now.getUTCMinutes();
  return nowUTC >= openUTC && nowUTC < closeUTC;
}

// ---------------------------------------------------------------------------
// Finnhub freshness
// ---------------------------------------------------------------------------

/**
 * Classifica la freshness di un dato Finnhub in base al contesto di mercato.
 *
 * - Mercato aperto → "delayed" (free tier: ~15 min di ritardo)
 * - Mercato chiuso → "market-closed" (mostriamo l'ultimo close della sessione
 *   precedente, che si comporta come EOD anche se Finnhub lo chiama "current")
 */
export function getFinnhubFreshness(now: Date = new Date()): DataFreshness {
  return isUSMarketOpen(now) ? "delayed" : "market-closed";
}

// ---------------------------------------------------------------------------
// CoinGecko freshness
// ---------------------------------------------------------------------------

/**
 * Soglia in secondi entro cui un dato CoinGecko viene classificato "near-live".
 * CoinGecko free API aggiorna i prezzi ogni ~60-120 s; con ISR revalidate:60
 * il dato può avere fino a ~2-3 minuti di età totale.
 * 5 minuti è una soglia conservativa e onesta.
 */
const NEAR_LIVE_THRESHOLD_SECONDS = 5 * 60; // 300 s

/**
 * Classifica la freshness di un dato CoinGecko.
 *
 * - Aggiornato negli ultimi 5 minuti → "near-live"
 *   (frequentemente aggiornato, ma non streaming reale)
 * - Più vecchio di 5 minuti (rate limit o problema provider) → "delayed"
 */
export function getCoinGeckoFreshness(
  lastUpdatedAt: number,
  now: Date = new Date(),
): DataFreshness {
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const ageSeconds = nowSeconds - lastUpdatedAt;
  return ageSeconds < NEAR_LIVE_THRESHOLD_SECONDS ? "near-live" : "delayed";
}

// ---------------------------------------------------------------------------
// Yahoo Finance freshness
// ---------------------------------------------------------------------------

/**
 * Classifica la freshness di un dato Yahoo Finance.
 *
 * - Strumenti always-open (crypto, forex 24/7) → "near-live"
 * - marketState "REGULAR" → "delayed" (free tier: dato quasi-realtime ma
 *   la ISR cache può aggiungere fino a 60 s di ritardo aggiuntivo)
 * - Qualsiasi altro stato (PRE, POST, CLOSED, PREPRE, POSTPOST) →
 *   "market-closed" (mostriamo l'ultimo prezzo della sessione precedente)
 */
export function getYahooFreshness(
  marketState: string | undefined,
  alwaysOpen: boolean,
): DataFreshness {
  if (alwaysOpen) return "near-live";
  switch (marketState) {
    case "REGULAR":  return "delayed";
    case "PRE":
    case "POST":
    case "CLOSED":
    case "PREPRE":
    case "POSTPOST": return "market-closed";
    default:         return "delayed";
  }
}
