import type { ProviderFundamentals } from "@/lib/providers/types";
import type { MarketCategoryId } from "@/types/markets";

interface AssetFundamentalsProps {
  fundamentals: ProviderFundamentals;
  category: MarketCategoryId;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmtCompact(n: number, prefix = "$"): string {
  if (n >= 1e12) return `${prefix}${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `${prefix}${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `${prefix}${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3)  return `${prefix}${(n / 1e3).toFixed(1)}K`;
  return `${prefix}${n.toFixed(2)}`;
}

function fmtPct(n: number, isDecimal = true): string {
  const pct = isDecimal ? n * 100 : n;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function fmtPctPlain(n: number, isDecimal = true): string {
  const pct = isDecimal ? n * 100 : n;
  return `${pct.toFixed(2)}%`;
}

function fmtMultiple(n: number): string {
  return `${n.toFixed(2)}x`;
}

function fmtNumber(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

function fmtSupply(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtVolume(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

// ---------------------------------------------------------------------------
// Row + Group primitives
// ---------------------------------------------------------------------------

function Row({ label, value, highlight }: { label: string; value: string; highlight?: "green" | "red" }) {
  const valueClass = highlight === "green"
    ? "text-accent-green"
    : highlight === "red"
    ? "text-error"
    : "text-text-primary";
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className={`font-mono text-xs font-medium tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-bg-hover/30 px-3 py-3">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary/40">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AssetFundamentals({ fundamentals: f, category }: AssetFundamentalsProps) {
  const groups: React.ReactNode[] = [];

  // ── Valuation ──────────────────────────────────────────────────────────────
  const valuationRows: React.ReactNode[] = [];
  if (f.trailingPE != null)  valuationRows.push(<Row key="pe"   label="P/E (TTM)"    value={fmtMultiple(f.trailingPE)} />);
  if (f.forwardPE  != null)  valuationRows.push(<Row key="fpe"  label="Forward P/E"  value={fmtMultiple(f.forwardPE)} />);
  if (f.priceToBook != null) valuationRows.push(<Row key="pb"   label="Price / Book" value={fmtMultiple(f.priceToBook)} />);
  if (f.beta       != null)  valuationRows.push(<Row key="beta" label="Beta"         value={fmtNumber(f.beta)} />);
  if (f.eps        != null)  valuationRows.push(<Row key="eps"  label="EPS (TTM)"    value={`$${fmtNumber(f.eps)}`} />);
  if (f.dividendYield != null) valuationRows.push(
    <Row key="dy" label="Dividend Yield" value={fmtPctPlain(f.dividendYield, false)} />
  );
  if (valuationRows.length > 0) groups.push(<Group key="val" title="Valuation">{valuationRows}</Group>);

  // ── Profitability ──────────────────────────────────────────────────────────
  const profitRows: React.ReactNode[] = [];
  if (f.revenue        != null) profitRows.push(<Row key="rev"  label="Revenue (TTM)"       value={fmtCompact(f.revenue)} />);
  if (f.ebitda         != null) profitRows.push(<Row key="ebd"  label="EBITDA"              value={fmtCompact(f.ebitda)} />);
  if (f.grossMargin    != null) profitRows.push(
    <Row key="gm"  label="Gross Margin"         value={fmtPctPlain(f.grossMargin)}
         highlight={f.grossMargin >= 0.4 ? "green" : undefined} />
  );
  if (f.operatingMargin != null) profitRows.push(
    <Row key="om"  label="Operating Margin"     value={fmtPctPlain(f.operatingMargin)}
         highlight={f.operatingMargin > 0 ? "green" : "red"} />
  );
  if (f.profitMargin   != null) profitRows.push(
    <Row key="pm"  label="Net Profit Margin"    value={fmtPctPlain(f.profitMargin)}
         highlight={f.profitMargin > 0 ? "green" : "red"} />
  );
  if (f.returnOnEquity != null) profitRows.push(
    <Row key="roe" label="Return on Equity"     value={fmtPct(f.returnOnEquity)}
         highlight={f.returnOnEquity > 0 ? "green" : "red"} />
  );
  if (f.returnOnAssets != null) profitRows.push(
    <Row key="roa" label="Return on Assets"     value={fmtPct(f.returnOnAssets)}
         highlight={f.returnOnAssets > 0 ? "green" : "red"} />
  );
  if (f.debtToEquity   != null) profitRows.push(<Row key="de"  label="Debt / Equity" value={fmtNumber(f.debtToEquity)} />);
  if (profitRows.length > 0) groups.push(<Group key="prof" title="Financials">{profitRows}</Group>);

  // ── Market Cap (all categories except forex/bond/commodity) ─────────────────
  if (category !== "forex" && category !== "bond" && category !== "commodity") {
    const marketCapRows: React.ReactNode[] = [];
    if (f.marketCap != null) marketCapRows.push(<Row key="mc" label="Market Cap" value={fmtCompact(f.marketCap)} />);
    if (f.avgVolume != null) marketCapRows.push(<Row key="vol" label="Avg. Volume (3M)" value={fmtVolume(f.avgVolume)} />);
    if (marketCapRows.length > 0) groups.push(<Group key="mc" title="Market Data">{marketCapRows}</Group>);
  }

  // ── ETF Profile ────────────────────────────────────────────────────────────
  if (category === "etf") {
    const etfRows: React.ReactNode[] = [];
    if (f.netAssets    != null) etfRows.push(<Row key="aum" label="Net Assets (AUM)" value={fmtCompact(f.netAssets)} />);
    if (f.fundYield    != null) etfRows.push(<Row key="fy"  label="Trailing Yield"   value={fmtPctPlain(f.fundYield)} />);
    if (f.expenseRatio != null) etfRows.push(<Row key="er"  label="Expense Ratio"    value={fmtPctPlain(f.expenseRatio)} />);
    if (f.fundFamily)           etfRows.push(<Row key="ff"  label="Fund Family"      value={f.fundFamily} />);
    if (f.fundCategory)         etfRows.push(<Row key="fc"  label="Category"         value={f.fundCategory} />);
    if (etfRows.length > 0) groups.push(<Group key="etf" title="ETF Profile">{etfRows}</Group>);
  }

  // ── Crypto Metrics ─────────────────────────────────────────────────────────
  if (category === "crypto") {
    const cryptoRows: React.ReactNode[] = [];
    if (f.circulatingSupply  != null) cryptoRows.push(<Row key="cs" label="Circulating Supply" value={fmtSupply(f.circulatingSupply)} />);
    if (cryptoRows.length > 0) groups.push(<Group key="crypto" title="Crypto">{cryptoRows}</Group>);
  }

  if (groups.length === 0) return null;

  return (
    <section className="rounded-card border border-bg-border/70 bg-bg-card p-5">
      <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        Fundamentals
      </h2>

      {/* Responsive grid: 1 col mobile, 2 col desktop when 2+ groups, avoid cramped narrow */}
      <div className={`grid gap-3 ${groups.length >= 2 ? "md:grid-cols-2" : ""}`}>
        {groups.map((group, i) => (
          <div key={i}>{group}</div>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-text-secondary/40">
        Data from Yahoo Finance · Cached hourly
      </p>
    </section>
  );
}
