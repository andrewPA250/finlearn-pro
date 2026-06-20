#!/usr/bin/env node

/**
 * Candidate-symbol verifier — live network check against Yahoo Finance.
 *
 * Asset Universe Expansion (Safe Phase 1): before any candidate ticker is
 * added to lib/markets/catalog.ts, it must be proven real by an actual
 * Yahoo Finance quote response — never trusted from memory/training data.
 * This script is the enforcement point for that rule.
 *
 * Input: a JSON array of candidates, each
 *   { symbol, name, category, yahooSymbol, tradingViewSymbol? }
 * read from the file path given as argv[2].
 *
 * For each candidate:
 *  - calls yahooFinance.quote(yahooSymbol)
 *  - PASS only if response has a non-null, non-zero regularMarketPrice
 *  - also checks the candidate doesn't collide with an existing catalog
 *    symbol/yahooSymbol, and that `symbol` is a safe route-slug (no
 *    "/", whitespace, or other characters that would break /asset/[symbol])
 *
 * Verified-only candidates are written to <input>.verified.json — that file
 * is the only thing that should ever be pasted into catalog.ts.
 * Failures are printed with the reason so they can be dropped or corrected.
 *
 * Run: node scripts/verify-candidates.mjs scripts/candidates/batch-01.json
 */

import { readFileSync, writeFileSync } from "node:fs";
import YahooFinanceClass from "yahoo-finance2";
import { MARKET_INSTRUMENTS } from "../lib/markets/catalog.ts";

const yahooFinance = new YahooFinanceClass({ suppressNotices: ["yahooSurvey", "ripHistorical"] });

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/verify-candidates.mjs <candidates.json>");
  process.exit(1);
}

const candidates = JSON.parse(readFileSync(inputPath, "utf-8"));

const existingSymbols = new Set(MARKET_INSTRUMENTS.map((i) => i.symbol));
const existingYahooSymbols = new Set(
  MARKET_INSTRUMENTS.filter((i) => i.yahooSymbol).map((i) => i.yahooSymbol)
);

const UNSAFE_SLUG = /[/\s?#%&]/;

const CONCURRENCY = 10; // gentle on Yahoo's unofficial API — slower than the 30 used for already-cached production quotes

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function verifyOne(c) {
  const reasons = [];

  if (!c.symbol) reasons.push("missing symbol");
  if (!c.name) reasons.push("missing name");
  if (!c.category) reasons.push("missing category");
  if (!c.yahooSymbol) reasons.push("missing yahooSymbol");
  if (c.symbol && UNSAFE_SLUG.test(c.symbol)) reasons.push(`unsafe route-slug character in symbol "${c.symbol}"`);
  if (c.symbol && existingSymbols.has(c.symbol)) reasons.push(`duplicate of existing catalog symbol "${c.symbol}"`);
  if (c.yahooSymbol && existingYahooSymbols.has(c.yahooSymbol)) reasons.push(`duplicate of existing catalog yahooSymbol "${c.yahooSymbol}"`);

  if (reasons.length > 0) {
    return { candidate: c, pass: false, reasons };
  }

  try {
    const raw = await yahooFinance.quote(c.yahooSymbol);
    const price = raw?.regularMarketPrice;
    if (!price || price === 0) {
      return { candidate: c, pass: false, reasons: [`Yahoo returned no usable regularMarketPrice for "${c.yahooSymbol}"`] };
    }
    const liveName = raw?.longName ?? raw?.shortName ?? "";
    // Ticker-collision guard: some short tickers (esp. crypto micro-caps) map
    // to a different, unrelated asset on Yahoo than the one intended. A
    // genuine match shares at least one significant word with the candidate
    // name (case-insensitive); this catches cases like candidate "The Graph"
    // (GRT) actually resolving to "Golden Ratio Token" on Yahoo's GRT-USD.
    const candidateWords = c.name.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
    const liveWords = new Set(liveName.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
    const nameOverlaps = candidateWords.some((w) => liveWords.has(w));
    if (!nameOverlaps) {
      return {
        candidate: c,
        pass: false,
        reasons: [`Likely ticker collision: candidate name "${c.name}" shares no word with Yahoo's returned name "${liveName}" for "${c.yahooSymbol}" — verify by hand before adding`],
      };
    }
    return { candidate: c, pass: true, reasons: [], livePrice: price, liveName };
  } catch (err) {
    return { candidate: c, pass: false, reasons: [`Yahoo quote() threw: ${err?.message ?? err}`] };
  }
}

async function main() {
  console.log(`\n=== Verifying ${candidates.length} candidates against live Yahoo Finance ===\n`);

  const results = [];
  for (let i = 0; i < candidates.length; i += CONCURRENCY) {
    const batch = candidates.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(verifyOne));
    results.push(...batchResults);
    console.log(`  ...${Math.min(i + CONCURRENCY, candidates.length)}/${candidates.length} checked`);
    await sleep(250); // small pacing gap between batches, unofficial API has no documented rate limit
  }

  const passed = results.filter((r) => r.pass);
  const failed = results.filter((r) => !r.pass);

  console.log(`\nPASSED: ${passed.length}/${results.length}`);
  console.log(`FAILED: ${failed.length}/${results.length}\n`);

  if (failed.length > 0) {
    console.log("--- Failed candidates (excluded) ---");
    for (const f of failed) {
      console.log(`  ${(f.candidate.symbol ?? "?").padEnd(10)} ${f.reasons.join("; ")}`);
    }
    console.log("");
  }

  if (passed.length > 0) {
    console.log("--- Passed candidates ---");
    for (const p of passed) {
      console.log(`  ${p.candidate.symbol.padEnd(10)} yahoo="${p.candidate.yahooSymbol}" livePrice=${p.livePrice} liveName="${p.liveName ?? "?"}"`);
    }
  }

  const outPath = inputPath.replace(/\.json$/, "") + ".verified.json";
  writeFileSync(outPath, JSON.stringify(passed.map((p) => p.candidate), null, 2));
  console.log(`\nWrote ${passed.length} verified candidates to ${outPath}\n`);
}

main();
