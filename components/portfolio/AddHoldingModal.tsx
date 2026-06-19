"use client";

import { useEffect, useRef, useState } from "react";
import type { MarketInstrument } from "@/types/markets";
import type { PortfolioHolding } from "@/lib/portfolio/types";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";

interface AddHoldingModalProps {
  instruments: MarketInstrument[];
  editing?: PortfolioHolding | null;
  onSave: (symbol: string, quantity: number, avgPrice: number, notes?: string) => void;
  onUpdate: (id: string, quantity: number, avgPrice: number, notes?: string) => void;
  onClose: () => void;
}

export function AddHoldingModal({
  instruments,
  editing,
  onSave,
  onUpdate,
  onClose,
}: AddHoldingModalProps) {
  const { language } = useSettings();
  const isEdit = !!editing;

  const [symbol, setSymbol] = useState(editing?.symbol ?? "");
  const [quantity, setQuantity] = useState(editing ? String(editing.quantity) : "");
  const [avgPrice, setAvgPrice] = useState(editing ? String(editing.avgPrice) : "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [symbolError, setSymbolError] = useState("");
  const [suggestions, setSuggestions] = useState<MarketInstrument[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const symbolRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const bySymbol = Object.fromEntries(instruments.map((i) => [i.symbol, i]));

  useEffect(() => {
    symbolRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSymbolChange(val: string) {
    const upper = val.toUpperCase();
    setSymbol(upper);
    setSymbolError("");

    if (upper.length >= 1) {
      const matches = instruments
        .filter(
          (i) =>
            i.symbol.startsWith(upper) ||
            i.name.toLowerCase().includes(val.toLowerCase())
        )
        .slice(0, 6);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(inst: MarketInstrument) {
    setSymbol(inst.symbol);
    setSymbolError("");
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function validate(): boolean {
    const sym = symbol.trim().toUpperCase();
    if (!sym) {
      setSymbolError(t("symbolRequired", language));
      return false;
    }
    if (!bySymbol[sym]) {
      setSymbolError(`"${sym}" ${t("notInCatalog", language)}`);
      return false;
    }
    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      setSymbolError(t("quantityMustBePositive", language));
      return false;
    }
    const price = parseFloat(avgPrice);
    if (!avgPrice || isNaN(price) || price <= 0) {
      setSymbolError(t("avgPriceMustBePositive", language));
      return false;
    }
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const sym = symbol.trim().toUpperCase();
    const qty = parseFloat(quantity);
    const price = parseFloat(avgPrice);
    if (isEdit && editing) {
      onUpdate(editing.id, qty, price, notes || undefined);
    } else {
      onSave(sym, qty, price, notes || undefined);
    }
    onClose();
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-card border border-bg-border/20 bg-bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-bg-border/15 px-5 py-4">
          <h2 className="text-base font-semibold text-text-primary">
            {isEdit ? t("editHoldingModal", language) : t("addHoldingModal", language)}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition"
            aria-label={t("close", language) ?? "Close"}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Symbol */}
          <div className="relative">
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              {t("symbol", language)} *
            </label>
            <input
              ref={symbolRef}
              type="text"
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder={t("symbolPlaceholder", language)}
              disabled={isEdit}
              className="w-full rounded border border-bg-border/25 bg-bg-card/40 px-3 py-2 font-mono text-sm text-text-primary placeholder-text-muted focus:border-cyan/50 focus:outline-none disabled:opacity-50"
            />
            {showSuggestions && (
              <ul className="absolute z-10 mt-1 w-full rounded border border-bg-border/20 bg-bg-card shadow-lg">
                {suggestions.map((inst) => (
                  <li key={inst.symbol}>
                    <button
                      type="button"
                      onMouseDown={() => selectSuggestion(inst)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-bg-hover transition"
                    >
                      <span className="font-mono text-sm font-semibold text-cyan">
                        {inst.symbol}
                      </span>
                      <span className="truncate text-xs text-text-secondary">{inst.name}</span>
                      <span className="ml-auto shrink-0 rounded bg-bg-primary px-1.5 py-0.5 text-xs text-text-muted">
                        {inst.category}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {symbolError && (
              <p className="mt-1 text-xs text-red-500">{symbolError}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              {t("quantity", language)} *
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={t("quantityPlaceholder", language)}
              className="w-full rounded border border-bg-border/25 bg-bg-card/40 px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-cyan/50 focus:outline-none"
            />
          </div>

          {/* Average Buy Price */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              {t("avgPrice", language)} (USD) *
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              placeholder={t("avgPricePlaceholder", language)}
              className="w-full rounded border border-bg-border/25 bg-bg-card/40 px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-cyan/50 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              {t("notesOptional", language)}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t("notePlaceholder", language)}
              className="w-full resize-none rounded border border-bg-border/25 bg-bg-card/40 px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-cyan/50 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-bg-border/20 px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition"
            >
              {t("cancel", language)}
            </button>
            <button
              type="submit"
              className="flex-1 rounded bg-cyan px-4 py-2 text-sm font-semibold text-bg-primary hover:bg-cyan/90 transition"
            >
              {isEdit ? t("saveChanges", language) : t("addHolding", language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
