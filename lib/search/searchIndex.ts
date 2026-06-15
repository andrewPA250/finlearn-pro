import { LESSON_META } from "@/lib/lessonsMeta";

/**
 * Categorie di asset finanziari previste per il futuro catalogo Markets.
 * Non ancora collegate a dati reali: servono solo a tipizzare gli item
 * "asset" che la search potrà restituire in futuro senza cambiare la UI.
 */
export type AssetClass = "equity" | "etf" | "crypto" | "forex" | "commodity" | "bond";

export type SearchResultType = "nav" | "lesson" | "asset";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href?: string;
  assetClass?: AssetClass;
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

/**
 * Catalogo asset (azioni, ETF, crypto, forex, commodity, bond): vuoto fino
 * all'integrazione di un provider dati. Quando sarà disponibile, basterà
 * popolare questo array — `buildSearchSections` e la UI non richiedono
 * altre modifiche per mostrare i risultati.
 */
function getAssetItems(): SearchResultItem[] {
  return [];
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
      items: filterItems(getAssetItems()),
      emptyMessage: "Catalogo asset in arrivo",
    },
  ];

  return sections.filter((section) => section.items.length > 0 || section.emptyMessage !== undefined);
}
