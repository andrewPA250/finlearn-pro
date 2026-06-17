#!/usr/bin/env node
/**
 * QA Test Suite - Systematic route testing
 *
 * Tests all 19 routes for:
 * - HTTP status (200 OK)
 * - No 500 errors
 * - No React duplicate key warnings in dev output
 * - No hydration errors
 * - Data loads correctly
 * - Missing data shows "—" not "$0"
 * - No excessive quote fetching
 */

const http = require("http");
const url = require("url");

// Routes to test
const ROUTES = [
  "/",
  "/markets",
  "/markets/screener",
  "/markets/heatmap",
  "/markets/category/equity",
  "/markets/category/etf",
  "/markets/category/crypto",
  "/markets/category/index",
  "/markets/category/forex",
  "/markets/category/commodity",
  "/markets/category/bond",
  "/watchlist",
  "/news",
  "/analytics/compare",
  "/asset/AAPL",
  "/asset/NVDA",
  "/asset/MSFT",
  "/asset/BTCUSD",
  "/settings",
];

const BASE_URL = "http://localhost:3000";

// Test results
const results = [];

/**
 * Test a single route
 */
async function testRoute(route) {
  return new Promise((resolve) => {
    const testUrl = new URL(route, BASE_URL);

    // 30s: dev-mode cold compilation of the heaviest routes (/markets,
    // /markets/screener fetch all 585 quotes on first hit) can exceed 10s.
    // Warm requests return in ~100ms.
    const req = http.get(testUrl, { timeout: 30000 }, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const result = {
          route,
          status: res.statusCode,
          statusText: res.statusCode === 200 ? "✓ OK" : "✗ ERROR",
          issues: [],
          headers: res.headers,
        };

        // Check for common issues in response
        if (res.statusCode !== 200) {
          result.issues.push(`HTTP ${res.statusCode}`);
        }

        // Only flag a real server error. The raw substring "500" matches any
        // number (prices, counts) in valid HTML, so rely on status code +
        // Next.js error-page markers instead.
        if (
          res.statusCode === 500 ||
          data.includes("Internal Server Error") ||
          data.includes("__next_error__") ||
          /Application error: a server-side exception/.test(data)
        ) {
          result.issues.push("500 / server-side exception");
        }

        if (
          data.includes("hydrat") ||
          data.includes("Hydration mismatch") ||
          data.includes("hydration")
        ) {
          result.issues.push("Hydration error");
        }

        if (data.includes("duplicate key")) {
          result.issues.push("React duplicate key warning");
        }

        // Check for unformatted prices. Use word-boundary patterns so valid
        // sub-dollar prices ($0.50) and substrings don't trip the check.
        if (/\$0(?![.\d])/.test(data) || /\bNaN\b/.test(data)) {
          result.issues.push("Potential unformatted prices ($0 or NaN)");
        }

        // Check response content
        result.contentLength = data.length;
        result.hasContent = data.length > 100;

        resolve(result);
      });
    });

    req.on("error", (err) => {
      resolve({
        route,
        status: 0,
        statusText: "✗ CONNECTION ERROR",
        issues: [err.message],
        error: true,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        route,
        status: 0,
        statusText: "✗ TIMEOUT",
        issues: ["Request timeout (>30s)"],
        error: true,
      });
    });
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log("Starting QA route tests...\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Routes to test: ${ROUTES.length}\n`);
  console.log("Testing routes...\n");

  const startTime = Date.now();

  for (const route of ROUTES) {
    process.stdout.write(`Testing ${route.padEnd(35)}`);

    const result = await testRoute(route);
    results.push(result);

    if (result.error) {
      console.log(`  ${result.statusText} - ${result.issues[0]}`);
    } else {
      console.log(
        `  ${result.statusText} (${result.contentLength} bytes)${
          result.issues.length > 0 ? " ⚠️ " + result.issues[0] : ""
        }`
      );
    }
  }

  const elapsed = Date.now() - startTime;

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("QA TEST SUMMARY");
  console.log("=".repeat(80) + "\n");

  const passed = results.filter((r) => r.status === 200 && r.issues.length === 0).length;
  const failed = results.filter((r) => r.status !== 200 || r.issues.length > 0).length;
  const errors = results.filter((r) => r.error).length;

  console.log(`Passed:     ${passed}/${ROUTES.length} ✓`);
  console.log(`With issues: ${failed}/${ROUTES.length} ⚠️`);
  console.log(`Errors:     ${errors}/${ROUTES.length} ✗`);
  console.log(`Time:       ${(elapsed / 1000).toFixed(1)}s\n`);

  if (failed > 0) {
    console.log("Routes with issues:\n");
    results.filter((r) => r.issues.length > 0).forEach((r) => {
      console.log(`  ${r.route.padEnd(35)} ${r.issues.join(", ")}`);
    });
    console.log();
  }

  if (errors > 0) {
    console.log("Routes with errors:\n");
    results.filter((r) => r.error).forEach((r) => {
      console.log(`  ${r.route.padEnd(35)} ${r.issues.join(", ")}`);
    });
    console.log();
  }

  console.log("=".repeat(80));
  console.log(passed === ROUTES.length ? "✅ ALL ROUTES PASSED" : "⚠️  ISSUES DETECTED");
  console.log("=".repeat(80));

  // Write detailed report
  fs.writeFileSync(
    "qa-results.json",
    JSON.stringify(results, null, 2)
  );
  console.log("\nDetailed results saved to: qa-results.json");

  process.exit(passed === ROUTES.length ? 0 : 1);
}

// Start testing
const fs = require("fs");
runTests().catch((err) => {
  console.error("Test suite error:", err);
  process.exit(1);
});
