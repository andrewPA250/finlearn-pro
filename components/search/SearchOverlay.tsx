"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildSearchSections, type SearchResultItem } from "@/lib/search/searchIndex";
import { SearchIcon } from "@/components/layout/icons";
import { MarketStatusBadge } from "@/components/markets/MarketStatusBadge";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  /** Destinazione dinamica della voce "Learn" (prossima lezione accessibile). */
  learnHref: string;
}

/**
 * Search overlay / command palette: apre con click sulla search del Header
 * o Ctrl/Cmd+K, chiude con ESC. Le sezioni (Vai a / Lezioni / Asset) sono
 * generate da `buildSearchSections`: nuove categorie (es. Markets) si
 * aggiungono lì, senza modificare questo componente.
 */
export function SearchOverlay({ open, onClose, learnHref }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const sections = useMemo(
    () =>
      buildSearchSections(query, {
        home: "/dashboard",
        learn: learnHref,
        workbench: "/workbench",
        profile: "/profile",
      }),
    [query, learnHref]
  );

  const flatItems = useMemo(() => sections.flatMap((section) => section.items), [sections]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function navigateTo(item: SearchResultItem | undefined) {
    if (!item?.href) return;
    onClose();
    router.push(item.href);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (flatItems.length === 0 ? 0 : (index + 1) % flatItems.length));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (flatItems.length === 0 ? 0 : (index - 1 + flatItems.length) % flatItems.length));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      navigateTo(flatItems[activeIndex]);
    }
  }

  if (!open) return null;

  let renderedIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex justify-center px-4 pt-[12vh]" onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-label="Chiudi ricerca"
        className="fixed inset-0 bg-bg-primary/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 h-fit w-full max-w-xl overflow-hidden rounded-card border border-bg-card bg-bg-sidebar shadow-2xl">
        <div className="flex items-center gap-3 border-b border-bg-card px-4 py-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca pagine, lezioni, asset..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-text-secondary/20 px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
            Esc
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {sections.map((section) => (
            <div key={section.id} className="mb-2 last:mb-0">
              <p className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-text-secondary/60">
                {section.title}
              </p>

              {section.items.length === 0 ? (
                <p className="px-3 py-2 text-sm text-text-secondary/60">{section.emptyMessage}</p>
              ) : (
                section.items.map((item) => {
                  renderedIndex += 1;
                  const active = renderedIndex === activeIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(renderedIndex)}
                      onClick={() => navigateTo(item)}
                      className={`flex w-full items-center justify-between rounded-card px-3 py-2 text-left text-sm transition duration-150 ease-in-out ${
                        active
                          ? "bg-accent-purple/15 text-text-primary"
                          : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                      }`}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className={active ? "font-bold" : ""}>{item.title}</span>
                        {item.subtitle && (
                          <span className="truncate text-xs text-text-secondary/70">{item.subtitle}</span>
                        )}
                      </span>
                      {item.type === "asset" && item.assetStatus && (
                        <span className="ml-2 flex shrink-0 items-center">
                          <MarketStatusBadge status={item.assetStatus} />
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          ))}

          {flatItems.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-text-secondary/60">Nessun risultato</p>
          )}
        </div>
      </div>
    </div>
  );
}
