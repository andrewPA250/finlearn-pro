#!/usr/bin/env node

/**
 * Quick Yahoo Finance API validation for known assets
 * Tests crypto, European, and US stocks with different formats
 */

const TIMEOUT = 5000;

async function testYahooSymbol(internalSymbol, yahooSymbol) {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=price`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const price = data.quoteSummary?.result?.[0]?.price;

    if (price?.regularMarketPrice?.raw) {
      return {
        ok: true,
        price: price.regularMarketPrice.raw,
        currency: price.currency,
      };
    }

    return { ok: false, error: 'No price data' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function validateAssets() {
  const testCases = [
    // Crypto (must use DASH format on Yahoo)
    { internal: 'BNBUSD', yahoo: 'BNB-USD', name: 'Binance Coin' },
    { internal: 'BTCUSD', yahoo: 'BTC-USD', name: 'Bitcoin' },
    { internal: 'ETHUSD', yahoo: 'ETH-USD', name: 'Ethereum' },

    // US Mega-caps
    { internal: 'AAPL', yahoo: 'AAPL', name: 'Apple' },
    { internal: 'MSFT', yahoo: 'MSFT', name: 'Microsoft' },

    // Tech
    { internal: 'ASML', yahoo: 'ASML', name: 'ASML (no exchange suffix)' },
    { internal: 'ASML', yahoo: 'ASML.AS', name: 'ASML (with .AS suffix)' },

    // German
    { internal: 'SAP', yahoo: 'SAP', name: 'SAP (no exchange suffix)' },
    { internal: 'SAP', yahoo: 'SAP.DE', name: 'SAP (with .DE suffix)' },

    // Taiwan
    { internal: 'TSM', yahoo: 'TSM', name: 'Taiwan Semiconductors' },

    // ARK ETF
    { internal: 'ARKK', yahoo: 'ARKK', name: 'ARK Innovation ETF' },

    // European
    { internal: 'NOKIA', yahoo: 'NOK', name: 'Nokia' },
    { internal: 'ERIC', yahoo: 'ERIC', name: 'Ericsson' },

    // Test wrong formats to diagnose
    { internal: 'BNBUSD_WRONG', yahoo: 'BNBUSD', name: 'Binance (wrong format, no dash)' },
  ];

  console.log('\n🔍 Testing Yahoo Finance API responses:\n');

  for (const test of testCases) {
    const result = await testYahooSymbol(test.internal, test.yahoo);
    const status = result.ok ? '✅' : '❌';
    const details = result.ok
      ? `$${result.price} ${result.currency}`
      : result.error;

    console.log(`${status} ${test.yahoo.padEnd(12)} (${test.name.padEnd(30)}) → ${details}`);

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📋 Key findings:');
  console.log('   - Crypto uses DASH format: BTC-USD, ETH-USD, BNB-USD (NOT BTCUSD)');
  console.log('   - European stocks: Try without suffix first (SAP), then with (.SAP.DE)');
  console.log('   - US tickers: No suffix needed (ASML, TSM work directly)');
  console.log('   - ARK tickers: Standard format (ARKK)');
}

validateAssets().catch(console.error);
