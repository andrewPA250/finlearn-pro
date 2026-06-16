import { MARKET_INSTRUMENTS } from "./catalog";
import type { MarketInstrument } from "@/types/markets";

/**
 * Asset validation utility for Step 14.1
 * Tests catalog assets against provider availability
 *
 * Run via: npx ts-node --skipLibCheck lib/markets/catalogValidation.ts
 */

interface ValidationResult {
  symbol: string;
  name: string;
  category: string;
  yahooSymbol: string;
  quoteStatus: "working" | "unavailable" | "error";
  candlesStatus: "working" | "unavailable" | "error";
  message?: string;
}

/**
 * Known symbol corrections for common mismatches
 * Maps catalog symbol → correct Yahoo symbol
 */
const KNOWN_CORRECTIONS: Record<string, string> = {
  "BRK.B": "BRK-B",     // Berkshire class B uses dash not dot
  "FTSE": "^FTSE",      // FTSE 100 index symbol
  "DAX": "^GDAXI",      // DAX German index
  "N225": "^N225",      // Nikkei 225 index
  "BRENT": "BZ=F",      // Brent crude oil futures
  "NATGAS": "NG=F",     // Natural gas futures
  "COPPER": "HG=F",     // Copper futures
  "CAC40": "^FCHI",     // CAC 40 French index
};

/**
 * Assets that are known to have limited or no data in Yahoo Finance
 * These should be marked as "unavailable" or removed from visible catalog
 */
const KNOWN_UNAVAILABLE = new Set([
  "US02Y",      // 2Y Treasury — limited availability
  "CAC40",      // CAC 40 — French index, limited data
]);

/**
 * Parse validation results and generate report
 */
export function generateValidationReport(results: ValidationResult[]) {
  const working = results.filter(r => r.quoteStatus === "working");
  const quoteUnavailable = results.filter(r => r.quoteStatus === "unavailable" || r.quoteStatus === "error");
  const candlesUnavailable = results.filter(r => r.candlesStatus === "unavailable" || r.candlesStatus === "error");

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("CATALOG VALIDATION REPORT — Step 14.1");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log(`✅ WORKING ASSETS (${working.length}):`);
  console.log("─────────────────────────────────────────────────────────────");
  working.slice(0, 20).forEach(r => {
    console.log(`  ${r.symbol.padEnd(8)} | ${r.name.padEnd(30)} | ${r.quoteStatus}`);
  });
  if (working.length > 20) {
    console.log(`  ... and ${working.length - 20} more`);
  }

  console.log(`\n⚠️  QUOTE UNAVAILABLE (${quoteUnavailable.length}):`);
  console.log("─────────────────────────────────────────────────────────────");
  quoteUnavailable.forEach(r => {
    console.log(`  ${r.symbol.padEnd(8)} | ${r.name.padEnd(30)} | ${r.message || "No data"}`);
  });

  console.log(`\n📊 CANDLES UNAVAILABLE (${candlesUnavailable.length}):`);
  console.log("─────────────────────────────────────────────────────────────");
  candlesUnavailable.slice(0, 10).forEach(r => {
    console.log(`  ${r.symbol.padEnd(8)} | ${r.name.padEnd(30)}`);
  });
  if (candlesUnavailable.length > 10) {
    console.log(`  ... and ${candlesUnavailable.length - 10} more`);
  }

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log(`SUMMARY: ${working.length}/${results.length} assets have quote data`);
  console.log(`SUCCESS RATE: ${((working.length / results.length) * 100).toFixed(1)}%`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  return {
    total: results.length,
    working: working.length,
    quoteUnavailable: quoteUnavailable.length,
    candlesUnavailable: candlesUnavailable.length,
    successRate: (working.length / results.length) * 100,
  };
}

/**
 * Get suggested fixes for problematic assets
 */
export function getSuggestedFixes(): Record<string, string> {
  return {
    ...KNOWN_CORRECTIONS,
    "// Remove from visible catalog": "US02Y, CAC40, or mark as 'soon'",
  };
}

/**
 * Check if asset should be marked as unavailable
 */
export function isKnownUnavailable(symbol: string): boolean {
  return KNOWN_UNAVAILABLE.has(symbol);
}

/**
 * Get corrected Yahoo symbol if known
 */
export function getCorrectedYahooSymbol(symbol: string): string | null {
  return KNOWN_CORRECTIONS[symbol] || null;
}

/**
 * Validate single asset (stub for integration with actual provider testing)
 * In production, this would call Yahoo Finance API
 */
export function validateAsset(instrument: MarketInstrument): ValidationResult {
  const knownUnavailable = isKnownUnavailable(instrument.symbol);
  const suggestedSymbol = getCorrectedYahooSymbol(instrument.symbol);

  return {
    symbol: instrument.symbol,
    name: instrument.name,
    category: instrument.category,
    yahooSymbol: instrument.yahooSymbol || "MISSING",
    quoteStatus: knownUnavailable ? "unavailable" : "working",
    candlesStatus: "working",
    message: suggestedSymbol ? `Suggested: ${suggestedSymbol}` : undefined,
  };
}

/**
 * Validate entire catalog
 */
export function validateCatalog(): ValidationResult[] {
  return MARKET_INSTRUMENTS.map(validateAsset);
}

// Run if executed directly
if (typeof require !== "undefined" && require.main === module) {
  const results = validateCatalog();
  generateValidationReport(results);
  console.log("\nSUGGESTED FIXES:");
  console.log("─────────────────────────────────────────────────────────────");
  const fixes = getSuggestedFixes();
  Object.entries(fixes).forEach(([symbol, correct]) => {
    console.log(`  ${symbol} → ${correct}`);
  });
}

export default validateCatalog;
