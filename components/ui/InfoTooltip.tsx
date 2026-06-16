"use client";

import { useState, useRef, useEffect } from "react";

interface InfoTooltipProps {
  /** Testo mostrato nel tooltip. */
  text: string;
  /** Testo per aria-label (default: uguale a text). */
  label?: string;
}

/**
 * Icona ⓘ interattiva con tooltip contestuale.
 * - Desktop: hover o click mostra il tooltip sopra l'icona.
 * - Mobile: tap toggle.
 * - Accessibilità: aria-label sul button, role="tooltip" sul pannello.
 * - Click fuori nasconde il tooltip.
 */
export function InfoTooltip({ text, label }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!visible) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible]);

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={label ?? text}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-text-secondary/50 transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-purple"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        onBlur={() => setVisible(false)}
      >
        {/* Bootstrap Icons: info-circle */}
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
        </svg>
      </button>

      {visible && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-lg border border-bg-sidebar bg-bg-card px-3 py-2 text-[11px] leading-relaxed text-text-secondary shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}
