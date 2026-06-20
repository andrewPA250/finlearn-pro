#!/usr/bin/env node

/**
 * TradingView symbol audit — static, no network calls.
 *
 * Cross-references every catalog instrument's tradingViewSymbol (read
 * directly from lib/markets/catalog.ts — the only source of truth) against
 * the category-aware validateTradingViewSymbol() logic used at render time
 * (components/asset/TradingViewChart.tsx).
 *
 * Detects:
 *  - missing tradingViewSymbol (no chart possible)
 *  - duplicated tradingViewSymbol across multiple catalog symbols
 *  - Yahoo-style symbols accidentally used as TradingView symbols (^, =, suffixes)
 *  - malformed symbols (no "EXCHANGE:" prefix)
 *  - continuous-futures contracts ("...1!") — high risk of requiring a paid
 *    TradingView real-time data plan, the most common real-world cause of
 *    the "this symbol is only available on TradingView" popup + silent
 *    fallback to a default symbol
 *  - catalog symbols not covered by validateTradingViewSymbol (Advanced
 *    Chart hidden, clean "unavailable" fallback shown instead)
 *  - explicit equity/ETF whitelist entries with no matching catalog instrument
 *
 * Run: node scripts/audit-tradingview-symbols.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { MARKET_INSTRUMENTS } from "../lib/markets/catalog.ts";

// TradingViewChart.tsx contains JSX, which Node's native TS loader can't
// parse — so we read the explicit equity/ETF whitelist straight from the
// source text instead of importing the component module. This keeps the
// whitelist single-sourced in TradingViewChart.tsx; this script mirrors the
// *current* file content and re-implements the same category rules for
// audit purposes (kept in sync manually with validateTradingViewSymbol()).
const __dirname = dirname(fileURLToPath(import.meta.url));
const tvChartSource = readFileSync(
  join(__dirname, "../components/asset/TradingViewChart.tsx"),
  "utf-8"
);

const whitelistBlockMatch = tvChartSource.match(
  /const VERIFIED_EQUITY_ETF_SYMBOLS = new Set\(\[([\s\S]*?)\]\);/
);
if (!whitelistBlockMatch) {
  throw new Error("Could not locate VERIFIED_EQUITY_ETF_SYMBOLS in TradingViewChart.tsx — audit script is out of sync.");
}
const VERIFIED_EQUITY_ETF_SYMBOLS = new Set(
  [...whitelistBlockMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
);

const FUTURES_CONTINUOUS = /\d!$/;

function validateTradingViewSymbol(symbol, category) {
  if (!symbol) return false;
  if (FUTURES_CONTINUOUS.test(symbol)) return false;
  switch (category) {
    case "index":
    case "bond":
    case "commodity":
      return true;
    case "forex":
      return symbol.startsWith("FX:");
    case "crypto":
      return symbol.startsWith("BINANCE:") && symbol.endsWith("USDT");
    case "equity":
    case "etf":
      return VERIFIED_EQUITY_ETF_SYMBOLS.has(symbol);
    default:
      return VERIFIED_EQUITY_ETF_SYMBOLS.has(symbol);
  }
}

const YAHOO_STYLE = /[\^=]|-(USD|USDT)$/;
const HAS_EXCHANGE_PREFIX = /^[A-Z0-9]+:/;

const report = {
  total: MARKET_INSTRUMENTS.length,
  missingTvSymbol: [],
  duplicates: [],
  yahooStyleMisuse: [],
  malformed: [],
  futuresContinuous: [],
  notInWhitelist: [],
  whitelistAdvancedYes: [],
  whitelistAdvancedNo: [],
  byCategory: {},
};

const bySymbolValue = new Map();

for (const inst of MARKET_INSTRUMENTS) {
  const tv = inst.tradingViewSymbol;

  if (!tv) {
    report.missingTvSymbol.push({ symbol: inst.symbol, category: inst.category });
    continue;
  }

  if (!bySymbolValue.has(tv)) bySymbolValue.set(tv, []);
  bySymbolValue.get(tv).push(inst.symbol);

  if (YAHOO_STYLE.test(tv)) {
    report.yahooStyleMisuse.push({ symbol: inst.symbol, tradingViewSymbol: tv });
  }

  if (!HAS_EXCHANGE_PREFIX.test(tv)) {
    report.malformed.push({ symbol: inst.symbol, tradingViewSymbol: tv });
  }

  if (FUTURES_CONTINUOUS.test(tv)) {
    report.futuresContinuous.push({ symbol: inst.symbol, tradingViewSymbol: tv, category: inst.category });
  }

  const valid = validateTradingViewSymbol(tv, inst.category);
  const entry = {
    symbol: inst.symbol,
    category: inst.category,
    yahooSymbol: inst.yahooSymbol ?? null,
    tradingViewSymbol: tv,
  };

  report.byCategory[inst.category] ??= { total: 0, available: 0 };
  report.byCategory[inst.category].total++;
  if (valid) report.byCategory[inst.category].available++;

  if (valid) {
    report.whitelistAdvancedYes.push(entry);
  } else {
    report.whitelistAdvancedNo.push(entry);
    report.notInWhitelist.push(entry);
  }
}

for (const [tv, symbols] of bySymbolValue) {
  if (symbols.length > 1) {
    report.duplicates.push({ tradingViewSymbol: tv, symbols });
  }
}

const orphanedWhitelistEntries = [...VERIFIED_EQUITY_ETF_SYMBOLS].filter((tv) => !bySymbolValue.has(tv));

// ---------------------------------------------------------------------------
// Print report
// ---------------------------------------------------------------------------

console.log(`\n=== TradingView Symbol Audit — ${report.total} catalog instruments ===\n`);

console.log(`Advanced Chart AVAILABLE: ${report.whitelistAdvancedYes.length}`);
console.log(`Advanced Chart UNAVAILABLE (clean fallback shown): ${report.whitelistAdvancedNo.length}\n`);

console.log("By category:");
for (const [cat, { total, available }] of Object.entries(report.byCategory)) {
  console.log(`  ${cat.padEnd(10)} ${available}/${total} available`);
}

console.log(`\n--- Missing tradingViewSymbol (${report.missingTvSymbol.length}) ---`);
for (const e of report.missingTvSymbol) console.log(`  ${e.symbol} (${e.category})`);

console.log(`\n--- Duplicated tradingViewSymbol (${report.duplicates.length}) ---`);
for (const e of report.duplicates) console.log(`  ${e.tradingViewSymbol} <- ${e.symbols.join(", ")}`);

console.log(`\n--- Yahoo-style symbol misuse (${report.yahooStyleMisuse.length}) ---`);
for (const e of report.yahooStyleMisuse) console.log(`  ${e.symbol}: "${e.tradingViewSymbol}"`);

console.log(`\n--- Malformed (no EXCHANGE: prefix) (${report.malformed.length}) ---`);
for (const e of report.malformed) console.log(`  ${e.symbol}: "${e.tradingViewSymbol}"`);

console.log(`\n--- Continuous futures contracts ("...1!") — excluded until manually verified embeddable (${report.futuresContinuous.length}) ---`);
for (const e of report.futuresContinuous) console.log(`  ${e.symbol} (${e.category}): "${e.tradingViewSymbol}"`);

console.log(`\n--- Equity/ETF whitelist entries with NO matching catalog instrument (orphaned) (${orphanedWhitelistEntries.length}) ---`);
for (const tv of orphanedWhitelistEntries) console.log(`  ${tv}`);

console.log(`\n--- Equity/ETF NOT in verified whitelist → Advanced Chart hidden, clean fallback shown (${report.notInWhitelist.filter((e) => e.category === "equity" || e.category === "etf").length}) ---`);
for (const e of report.notInWhitelist.filter((e) => e.category === "equity" || e.category === "etf")) {
  console.log(`  ${e.symbol.padEnd(10)} (${e.category.padEnd(10)}) tv="${e.tradingViewSymbol}" yahoo="${e.yahooSymbol}"`);
}

console.log(`\n--- Non equity/ETF still unavailable (futures-only, expected) (${report.notInWhitelist.filter((e) => e.category !== "equity" && e.category !== "etf").length}) ---`);
for (const e of report.notInWhitelist.filter((e) => e.category !== "equity" && e.category !== "etf")) {
  console.log(`  ${e.symbol.padEnd(10)} (${e.category.padEnd(10)}) tv="${e.tradingViewSymbol}" yahoo="${e.yahooSymbol}"`);
}

console.log(`\n=== End of audit ===\n`);

// Also dump full per-asset table for the explicitly required test list.
const TEST_LIST = [
  "SPX", "NDX", "DJI", "RUT", "VIX",
  "US02Y", "US10Y", "US30Y",
  "WTI", "BRENT", "XAUUSD", "XAGUSD", "NATGAS",
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF",
  "BTCUSD", "ETHUSD", "SOLUSD", "XRPUSD", "ADAUSD",
  "SPY", "QQQ", "VOO", "VTI", "SCHD", "AGG", "BND",
  "AAPL", "MSFT", "NVDA", "AMD", "PLTR", "META", "GOOGL", "TSLA",
];

console.log(`=== Required test-list status (${TEST_LIST.length} assets) ===\n`);
console.log("symbol".padEnd(10), "category".padEnd(10), "yahooSymbol".padEnd(14), "tradingViewSymbol".padEnd(22), "advanced");
for (const sym of TEST_LIST) {
  const inst = MARKET_INSTRUMENTS.find((i) => i.symbol === sym);
  if (!inst) {
    console.log(sym.padEnd(10), "—".padEnd(10), "—".padEnd(14), "—".padEnd(22), "NOT IN CATALOG");
    continue;
  }
  const tv = inst.tradingViewSymbol ?? "(none)";
  const valid = validateTradingViewSymbol(inst.tradingViewSymbol, inst.category);
  console.log(
    inst.symbol.padEnd(10),
    inst.category.padEnd(10),
    (inst.yahooSymbol ?? "—").padEnd(14),
    tv.padEnd(22),
    valid ? "YES" : "NO"
  );
}
console.log("");
