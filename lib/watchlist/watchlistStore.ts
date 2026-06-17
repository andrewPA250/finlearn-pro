import { WATCHLIST_STORAGE_KEY, WATCHLIST_MAX_SIZE } from "./types";

/**
 * Load watchlist from localStorage, or return empty array if unavailable.
 * SSR-safe: handles server/client execution gracefully.
 */
export function loadWatchlist(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Filter to valid symbols (non-empty strings)
    return parsed.filter((s): s is string => typeof s === "string" && s.length > 0);
  } catch {
    return [];
  }
}

/**
 * Persist watchlist to localStorage.
 * Assumes symbols are already validated.
 */
export function saveWatchlist(symbols: string[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(symbols));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Add a symbol to the watchlist.
 * Returns the updated watchlist if successful, or the unchanged list if at max capacity.
 */
export function addToWatchlist(symbol: string): string[] {
  const current = loadWatchlist();
  const normalized = symbol.trim().toUpperCase();

  // Already in watchlist
  if (current.includes(normalized)) return current;

  // At max capacity
  if (current.length >= WATCHLIST_MAX_SIZE) return current;

  const updated = [...current, normalized];
  saveWatchlist(updated);
  return updated;
}

/**
 * Remove a symbol from the watchlist.
 * Returns the updated watchlist.
 */
export function removeFromWatchlist(symbol: string): string[] {
  const current = loadWatchlist();
  const normalized = symbol.trim().toUpperCase();
  const updated = current.filter((s) => s !== normalized);
  saveWatchlist(updated);
  return updated;
}

/**
 * Check if a symbol is in the watchlist.
 */
export function isInWatchlist(symbol: string): boolean {
  const watchlist = loadWatchlist();
  const normalized = symbol.trim().toUpperCase();
  return watchlist.includes(normalized);
}

/**
 * Get the full watchlist.
 */
export function getWatchlist(): string[] {
  return loadWatchlist();
}

/**
 * Clear the entire watchlist.
 */
export function clearWatchlist(): void {
  saveWatchlist([]);
}

/**
 * Check if watchlist is at maximum capacity.
 */
export function isWatchlistFull(): boolean {
  return loadWatchlist().length >= WATCHLIST_MAX_SIZE;
}

/**
 * Get remaining slots in watchlist.
 */
export function getWatchlistRemainingSlots(): number {
  return Math.max(0, WATCHLIST_MAX_SIZE - loadWatchlist().length);
}
