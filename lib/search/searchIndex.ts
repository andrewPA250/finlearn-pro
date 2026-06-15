import { LESSON_META } from "@/lib/lessonsMeta";
import { MARKET_CATEGORIES, MARKET_INSTRUMENTS } from "@/lib/markets/catalog";
import type { MarketCategoryId, MarketInstrumentStatus } from "@/types/markets";

export type SearchResultType = "nav" | "lesson" | "asset";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href?: string;
  assetClass?: MarketCategoryId;
  /** Presente solo per risultati `type: "asset"`: stato del catalogo Markets. */
  assetStatus?: MarketInstrumentStatus;
}

export interface SearchSection {
  id: string;
  title: string;
  items: SearchResultItem[];
  /** Messaggio mostrato quando la sezione non ha (ancora) risultati. */
  emptyMessage?: string;
}

interface NavDestinations {
  home: string;
  learn: string;
  workbench: string;
  profile: string;
}

/** Numero massimo di risultati Asset mostrati: mantiene la overlay compatta anche con un catalogo molto più grande. */
const MAX_ASSET_RESULTS = 8;

function getNavItems({ home, learn, workbench, profile }: NavDestinations): SearchResultItem[] {
  return [
    { id: "nav-home", type: "nav", title: "Home", href: home },
    { id: "nav-learn", type: "nav", title: "Learn", subtitle: "Continua il percorso", href: learn },
    { id: "nav-workbench", type: "nav", title: "Workbench", subtitle: "Grafico interattivo", href: workbench },
    { id: "nav-profile", type: "nav", title: "Profilo", href: profile },
  ];
}

function getLessonItems(): SearchResultItem[] {
  return LESSON_META.map((lesson) => ({
    id: `lesson-${lesson.id}`,
    type: "lesson",
    title: `Lezione ${lesson.id} — ${lesson.title}`,
    subtitle: lesson.keyConcept,
    href: `/lessons/${lesson.id}`,
  }));
}

const CATEGORY_LABELS: Partial<Record<MarketCategoryId, string>> = Object.fromEntries(
  MARKET_CATEGORIES.map((category) => [category.id, category.label])
);

/**
 * Catalogo asset (azioni, ETF, indici, crypto, forex, commodity, bond):
 * stessa fonte dati di `/markets` e `/asset/[symbol]` (`MARKET_INSTRUMENTS`).
 * Estendere il catalogo Markets popola automaticamente anche questi
 * risultati, senza altre modifiche.
 */
function getAssetItems(): SearchResultItem[] {
  return MARKET_INSTRUMENTS.map((instrument) => ({
    id: `asset-${instrument.symbol}`,
    type: "asset",
    title: instrument.symbol,
    subtitle: `${instrument.name} · ${CATEGORY_LABELS[instrument.category] ?? instrument.category}`,
    href: `/asset/${instrument.symbol}`,
    assetClass: instrument.category,
    assetStatus: instrument.status,
  }));
}

function matchesQuery(item: SearchResultItem, query: string): boolean {
  const haystack = `${item.title} ${item.subtitle ?? ""}`.toLowerCase();
  return haystack.includes(query);
}

/**
 * Costruisce le sezioni della search overlay filtrate per query.
 * Ogni sezione è indipendente: aggiungere nuove categorie (es. "Markets")
 * significa aggiungere una nuova entry a questo array, senza toccare il
 * componente di rendering.
 */
export function buildSearchSections(query: string, destinations: NavDestinations): SearchSection[] {
  const normalized = query.trim().toLowerCase();

  const filterItems = (items: SearchResultItem[]) =>
    normalized === "" ? items : items.filter((item) => matchesQuery(item, normalized));

  const sections: SearchSection[] = [
    { id: "go-to", title: "Vai a", items: filterItems(getNavItems(destinations)) },
    { id: "lessons", title: "Lezioni", items: filterItems(getLessonItems()) },
    {
      id: "assets",
      title: "Asset",
      items: filterItems(getAssetItems()).slice(0, MAX_ASSET_RESULTS),
      emptyMessage: "Nessun asset trovato",
    },
  ];

  return sections.filter((section) => section.items.length > 0 || section.emptyMessage !== undefined);
}
