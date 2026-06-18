import type { Currency } from "@/lib/settings/types";

export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case "EUR": return "€";
    case "GBP": return "£";
    default:    return "$";
  }
}

/**
 * Format a USD-denominated numeric value in the chosen display currency.
 *
 * @param usdValue   Raw value in USD (from provider).
 * @param currency   User's chosen display currency.
 * @param rate       Multiplier to go from USD → target currency (1.0 for USD).
 * @param available  Whether a live FX rate was obtained; false triggers USD fallback.
 */
export function formatMoney(
  usdValue: number | null | undefined,
  currency: Currency,
  rate: number,
  available: boolean
): string {
  if (usdValue == null || isNaN(usdValue)) return "—";

  if (currency === "USD" || !available) {
    // USD base, or FX rate unavailable → honest USD fallback
    const abs = Math.abs(usdValue);
    const sign = usdValue < 0 ? "-" : "";
    return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const converted = usdValue * rate;
  const sym = getCurrencySymbol(currency);
  const abs = Math.abs(converted);
  const sign = converted < 0 ? "-" : "";
  return `${sign}${sym}${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Compact price formatter — omits decimals for large values (used in market cards).
 */
export function formatMoneyCompact(
  usdValue: number | null | undefined,
  currency: Currency,
  rate: number,
  available: boolean
): string {
  if (usdValue == null || isNaN(usdValue)) return "—";

  const displayValue = currency !== "USD" && available ? usdValue * rate : usdValue;
  const sym = currency !== "USD" && available ? getCurrencySymbol(currency) : "$";
  const abs = Math.abs(displayValue);

  let formatted: string;
  if (abs >= 10000) {
    formatted = abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
  } else if (abs >= 1) {
    formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }

  const sign = displayValue < 0 ? "-" : "";
  return `${sign}${sym}${formatted}`;
}
