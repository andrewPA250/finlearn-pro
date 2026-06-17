#!/usr/bin/env node

/**
 * Validate catalog: Test EVERY asset against Yahoo Finance API
 * Produces report of working/failed assets
 * Output: validation-report.json with working/failed/removed assets
 */

import { MARKET_INSTRUMENTS } from '../lib/markets/catalog.ts';

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary';
const TIMEOUT = 5000;

async function fetchYahooQuote(yahooSymbol) {
  try {
    const url = `${YAHOO_BASE}/${yahooSymbol}?modules=price`;
    const response = await Promise.race([
      fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), TIMEOUT)
      ),
    ]);

    if (!response.ok) {
      return { ok: false, status: response.status, error: `HTTP ${response.status}` };
    }

    const data = await response.json();

    // Check if we got valid price data
    if (data.quoteSummary?.result?.[0]?.price) {
      const price = data.quoteSummary.result[0].price;
      return {
        ok: true,
        symbol: price.symbol,
        regularMarketPrice: price.regularMarketPrice?.raw,
        currency: price.currency,
      };
    }

    return { ok: false, error: 'No price data in response', data: JSON.stringify(data).slice(0, 200) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function validateCatalog() {
  console.log(`\n📊 CATALOG VALIDATION — Testing ${MARKET_INSTRUMENTS.length} assets\n`);

  const results = {
    total: MARKET_INSTRUMENTS.length,
    working: [],
    failed: [],
    noYahooSymbol: [],
    byCategory: {},
  };

  // Test each asset
  for (let i = 0; i < MARKET_INSTRUMENTS.length; i++) {
    const asset = MARKET_INSTRUMENTS[i];
    const pct = Math.round(((i + 1) / MARKET_INSTRUMENTS.length) * 100);
    process.stdout.write(`\r[${pct}%] Testing ${asset.symbol.padEnd(10)} (${asset.yahooSymbol || 'NO_YAHOO'})...`);

    // Track by category
    if (!results.byCategory[asset.category]) {
      results.byCategory[asset.category] = { total: 0, working: 0, failed: 0 };
    }
    results.byCategory[asset.category].total++;

    if (!asset.yahooSymbol) {
      results.noYahooSymbol.push({ symbol: asset.symbol, name: asset.name, category: asset.category });
      results.byCategory[asset.category].failed++;
      continue;
    }

    // Test against Yahoo
    const quote = await fetchYahooQuote(asset.yahooSymbol);

    if (quote.ok) {
      results.working.push({
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        yahooSymbol: asset.yahooSymbol,
        price: quote.regularMarketPrice,
        currency: quote.currency,
      });
      results.byCategory[asset.category].working++;
    } else {
      results.failed.push({
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        yahooSymbol: asset.yahooSymbol,
        error: quote.error,
      });
      results.byCategory[asset.category].failed++;
    }

    // Rate limit: 1 request per 100ms
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n\n✅ VALIDATION COMPLETE\n`);
  console.log(`Total Assets: ${results.total}`);
  console.log(`Working: ${results.working.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`No Yahoo Symbol: ${results.noYahooSymbol.length}`);
  console.log(`\nBy Category:`);

  Object.entries(results.byCategory).forEach(([cat, stats]) => {
    const pct = Math.round((stats.working / stats.total) * 100);
    console.log(`  ${cat.padEnd(15)} ${stats.working}/${stats.total} working (${pct}%)`);
  });

  // Log failed assets grouped by error
  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED ASSETS (${results.failed.length}):\n`);
    const byError = {};
    results.failed.forEach(asset => {
      if (!byError[asset.error]) byError[asset.error] = [];
      byError[asset.error].push(asset.symbol);
    });
    Object.entries(byError).forEach(([error, symbols]) => {
      console.log(`  ${error}:`);
      console.log(`    ${symbols.slice(0, 10).join(', ')}${symbols.length > 10 ? ` (+${symbols.length - 10} more)` : ''}`);
    });
  }

  return results;
}

validateCatalog().then(results => {
  console.log(`\n📁 Report saved to validation-report.json`);
  console.log(`\nTo fix: Update yahooSymbol for failed assets or remove them from catalog.\n`);
});
