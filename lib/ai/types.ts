/**
 * AI Analyst — shared types.
 *
 * The AI layer is intentionally provider-agnostic. The UI and API route speak
 * in these types only; concrete providers (OpenAI / Anthropic / Gemini) are
 * resolved at runtime in `lib/ai/provider.ts` based on environment variables.
 *
 * Design rules baked into these types:
 * - The model never receives raw page HTML/text. It receives a *structured*
 *   `AiContext` snapshot that the server formats into a clean prompt.
 * - Every numeric field is `number | null` — `null` means "unavailable", and
 *   the system prompt instructs the model to say so rather than guess.
 */

export type AiProviderId = "openai" | "anthropic" | "gemini";

export type AiRole = "user" | "assistant";

export interface AiMessage {
  role: AiRole;
  content: string;
}

// ─── Structured context pieces ───────────────────────────────────────────────

export interface AiAssetContext {
  symbol: string;
  name: string;
  category: string;
  /** Display currency the prices are expressed in (e.g. "USD"). */
  currency: string;
  price: number | null;
  changePercent: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  pe: number | null;
  marketCap: number | null;
}

export interface AiPortfolioHolding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  price: number | null;
  marketValue: number | null;
  plPct: number | null;
}

export interface AiPortfolioContext {
  currency: string;
  holdingsCount: number;
  totalCostBasis: number;
  totalMarketValue: number | null;
  holdings: AiPortfolioHolding[];
}

export interface AiAlertContext {
  total: number;
  active: number;
  triggered: number;
  items: { symbol: string; type: string; target: number; status: string }[];
}

export interface AiMarketSnapshotItem {
  symbol: string;
  label: string;
  price: number | null;
  changePercent: number | null;
}

export interface AiCalendarEventContext {
  title: string;
  date: string;
  type: string;
}

/**
 * The full structured snapshot handed to the model. All sections are optional —
 * the server only includes what is genuinely available, and omits the rest.
 */
export interface AiContext {
  language: "en" | "it";
  selectedAsset?: AiAssetContext | null;
  portfolio?: AiPortfolioContext | null;
  watchlist?: string[];
  alerts?: AiAlertContext | null;
  marketSnapshot?: AiMarketSnapshotItem[];
  calendarEvent?: AiCalendarEventContext | null;
}

// ─── Request / response envelopes ────────────────────────────────────────────

export interface AiChatRequest {
  messages: AiMessage[];
  context?: AiContext;
}

export type AiChatResponse =
  | { ok: true; reply: string; provider: AiProviderId; model: string }
  | {
      ok: false;
      error: "not_configured" | "provider_error" | "bad_request";
      message: string;
    };

/**
 * Concrete provider contract. Each implementation wraps a single vendor's HTTP
 * API and returns plain assistant text. No streaming in v1 — kept simple and
 * easy to swap.
 */
export interface AiProvider {
  id: AiProviderId;
  model: string;
  generate(system: string, messages: AiMessage[]): Promise<string>;
}
