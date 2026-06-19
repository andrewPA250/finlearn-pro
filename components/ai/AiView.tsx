"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { useSettings } from "@/lib/settings/SettingsContext";
import { usePortfolio } from "@/lib/portfolio/PortfolioContext";
import { useWatchlist } from "@/lib/watchlist/WatchlistContext";
import { useAlerts } from "@/lib/alerts/AlertsContext";
import { t } from "@/lib/settings/i18n";
import { SparkleIcon } from "@/components/layout/icons";
import { buildAiContext, collectSymbols, extractSymbolFromText } from "@/lib/ai/context";
import type { AiMessage, AiChatResponse } from "@/lib/ai/types";
import type { TickerQuote } from "@/lib/market/ticker";

type ConfigState = "checking" | "configured" | "not_configured";

interface SuggestedPrompt {
  labelKey:
    | "promptExplainAsset"
    | "promptPortfolioRisk"
    | "promptMarketsToday"
    | "promptCompare"
    | "promptCalendarEvent";
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { labelKey: "promptExplainAsset" },
  { labelKey: "promptPortfolioRisk" },
  { labelKey: "promptMarketsToday" },
  { labelKey: "promptCompare" },
  { labelKey: "promptCalendarEvent" },
];

export function AiView() {
  const { language } = useSettings();
  const { holdings } = usePortfolio();
  const { symbols: watchlist } = useWatchlist();
  const { alerts } = useAlerts();

  const [config, setConfig] = useState<ConfigState>("checking");
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [focusSymbol, setFocusSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Rate-limit cooldown: tick down once a second, never auto-retries the request.
  useEffect(() => {
    if (cooldownUntil === null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownLeft(remaining);
      if (remaining === 0) setCooldownUntil(null);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  // Probe whether an AI provider is configured (env lives server-side).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai")
      .then((r) => r.json())
      .then((d: { configured?: boolean }) => {
        if (!cancelled) setConfig(d?.configured ? "configured" : "not_configured");
      })
      .catch(() => {
        if (!cancelled) setConfig("not_configured");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-scroll to latest message: when user sends, when AI responds, when AI finishes.
  useEffect(() => {
    // Small delay ensures DOM has fully updated before scrolling
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || config === "not_configured" || cooldownLeft > 0) return;

    setError(null);
    const nextMessages: AiMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      // 0) A symbol mentioned directly in the question (e.g. "Explain AAPL")
      // always takes priority over a stale Focus Asset value from an earlier
      // turn — otherwise asking about a second asset would silently keep
      // using the first one. Falls back to the Focus Asset field when the
      // message doesn't name a catalog symbol.
      const detectedSymbol = extractSymbolFromText(trimmed);
      const effectiveFocus = detectedSymbol || focusSymbol || null;
      if (detectedSymbol && detectedSymbol !== focusSymbol) setFocusSymbol(detectedSymbol);

      // 1) Fetch fresh quotes for every symbol the context needs.
      const symbols = collectSymbols({
        holdings,
        watchlist,
        focusSymbol: effectiveFocus,
      });
      let quotes: Record<string, TickerQuote> = {};
      try {
        const qr = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbols.join(","))}`);
        if (qr.ok) quotes = (await qr.json()) as Record<string, TickerQuote>;
      } catch {
        // Quotes are best-effort; missing values render as "unavailable" downstream.
      }

      // 2) Assemble the structured context snapshot.
      const context = buildAiContext({
        language,
        currency: "USD",
        holdings,
        watchlist,
        alerts,
        quotes,
        focusSymbol: effectiveFocus,
      });

      // 3) Ask the AI.
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, context }),
      });
      const data = (await res.json()) as AiChatResponse;

      if (data.ok) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } else if (data.error === "not_configured") {
        setConfig("not_configured");
      } else if (data.error === "rate_limited") {
        setError(data.message || t("aiErrorGeneric", language));
        setCooldownUntil(Date.now() + 30_000);
      } else {
        setError(data.message || t("aiErrorGeneric", language));
      }
    } catch {
      setError(t("aiErrorGeneric", language));
    } finally {
      setLoading(false);
    }
  }

  function handlePrompt(key: SuggestedPrompt["labelKey"]) {
    send(t(key, language));
  }

  const showEmpty = messages.length === 0 && !loading;

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-3xl flex-col px-4 py-4 sm:px-6 sm:py-6">
      {/* Header */}
      <div className="mb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-card bg-cyan-bg/40 text-cyan">
            <SparkleIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">{t("aiAnalyst", language)}</h1>
              <span className="rounded border border-caution/30 bg-caution/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-caution">
                {t("aiEducational", language)}
              </span>
            </div>
            <p className="text-xs text-text-muted">{t("aiSubtitle", language)}</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mb-3 shrink-0 rounded-card border border-bg-border/15 bg-bg-card/50 px-3 py-2">
        <p className="text-[11px] leading-relaxed text-text-muted">⚠ {t("aiDisclaimer", language)}</p>
      </div>

      {config === "not_configured" ? (
        <NotConfigured language={language} />
      ) : (
        <>
          {/* Focus asset + context note */}
          <div className="mb-2 shrink-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="font-medium">{t("aiFocusAsset", language)}:</span>
              <input
                value={focusSymbol}
                onChange={(e) => setFocusSymbol(e.target.value.toUpperCase())}
                placeholder={t("aiFocusAssetPlaceholder", language)}
                className="w-28 rounded-card border border-bg-border/20 bg-bg-sidebar px-2 py-1 font-mono text-xs text-text-primary placeholder:text-text-muted/60 focus:border-cyan/40 focus:outline-none"
              />
            </label>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setError(null);
                }}
                className="self-start text-xs text-text-muted transition hover:text-text-secondary sm:self-auto"
              >
                {t("aiClearChat", language)}
              </button>
            )}
          </div>

          {/* Transcript */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto rounded-card border border-bg-border/15 bg-bg-card/30 p-4"
          >
            {showEmpty ? (
              <EmptyState language={language} onPrompt={handlePrompt} />
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <MessageBubble key={i} message={m} language={language} />
                ))}
                {loading && <ThinkingBubble language={language} />}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-2 shrink-0 rounded-card border border-negative/30 bg-negative/10 px-3 py-2 text-sm text-negative">
              {error}
              {cooldownLeft > 0 && (
                <span className="ml-1.5 font-mono text-negative/80">
                  {t("aiRateLimitWait", language).replace("{s}", String(cooldownLeft))}
                </span>
              )}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-2 shrink-0 flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder={t("aiInputPlaceholder", language)}
              className="max-h-40 min-h-[44px] flex-1 resize-none rounded-card border border-bg-border/20 bg-bg-sidebar px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-cyan/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || cooldownLeft > 0}
              className="h-[44px] shrink-0 rounded-card bg-cyan px-4 text-sm font-semibold text-bg-primary transition hover:bg-cyan-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? t("aiThinking", language)
                : cooldownLeft > 0
                ? `${cooldownLeft}s`
                : t("aiSend", language)}
            </button>
          </form>

          <p className="mt-1.5 shrink-0 text-[10px] leading-relaxed text-text-disabled/70">
            {t("aiContextNote", language)}
          </p>
        </>
      )}
    </div>
  );
}

/** Dense, terminal-style Markdown rendering for AI replies — tight spacing, no prose bloat. */
const aiMarkdownComponents: Components = {
  p: ({ children }) => (
    <p className="mt-2 text-sm leading-snug text-text-primary first:mt-0">{children}</p>
  ),
  h1: ({ children }) => (
    <p className="mt-3 text-sm font-bold text-text-primary first:mt-0">{children}</p>
  ),
  h2: ({ children }) => (
    <p className="mt-3 text-sm font-bold text-text-primary first:mt-0">{children}</p>
  ),
  h3: ({ children }) => (
    <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-cyan first:mt-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-sm leading-snug text-text-primary first:mt-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-1.5 list-decimal space-y-0.5 pl-4 text-sm leading-snug text-text-primary first:mt-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic text-text-secondary">{children}</em>,
  code: ({ children }) => (
    <code className="rounded bg-bg-sidebar px-1 py-0.5 font-mono text-[12px] text-cyan">{children}</code>
  ),
  hr: () => <hr className="my-2 border-bg-border/15" />,
};

function MessageBubble({ message, language }: { message: AiMessage; language: "en" | "it" }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-text-disabled">
          {isUser ? t("aiYou", language) : t("aiAnalyst", language)}
        </p>
        <div
          className={`rounded-card px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "whitespace-pre-wrap bg-cyan text-bg-primary"
              : "border border-bg-border/15 bg-bg-card text-text-primary"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown components={aiMarkdownComponents}>{message.content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

function ThinkingBubble({ language }: { language: "en" | "it" }) {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-card border border-bg-border/15 bg-bg-card px-3.5 py-2.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
        <span className="text-sm text-text-muted">{t("aiThinking", language)}</span>
      </div>
    </div>
  );
}

function EmptyState({
  language,
  onPrompt,
}: {
  language: "en" | "it";
  onPrompt: (key: SuggestedPrompt["labelKey"]) => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-bg/30 text-cyan">
        <SparkleIcon className="h-6 w-6" />
      </span>
      <h2 className="text-base font-semibold text-text-primary">{t("aiEmptyTitle", language)}</h2>
      <p className="mt-1 max-w-sm text-sm text-text-muted">{t("aiEmptyDesc", language)}</p>

      <p className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-disabled">
        {t("aiSuggestedPrompts", language)}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p.labelKey}
            type="button"
            onClick={() => onPrompt(p.labelKey)}
            className="rounded-full border border-bg-border/20 bg-bg-card px-3 py-1.5 text-xs text-text-secondary transition hover:border-cyan/40 hover:text-text-primary"
          >
            {t(p.labelKey, language)}
          </button>
        ))}
      </div>
    </div>
  );
}

function NotConfigured({ language }: { language: "en" | "it" }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-card border border-bg-border/15 bg-bg-card/30 px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bg-hover text-text-muted">
        <SparkleIcon className="h-7 w-7" />
      </span>
      <h2 className="text-lg font-semibold text-text-primary">{t("aiNotConfigured", language)}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
        {t("aiNotConfiguredDesc", language)}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {["OpenAI", "Anthropic", "Gemini"].map((p) => (
          <span
            key={p}
            className="rounded-full border border-bg-border/20 bg-bg-sidebar px-3 py-1 text-xs font-medium text-text-secondary"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
