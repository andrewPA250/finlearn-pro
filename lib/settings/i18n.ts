import type { Language } from "./types";

export const translations = {
  en: {
    // Header
    "settings": "Settings",
    "profile": "Profile",
    "signOut": "Sign Out",
    "language": "Language",
    "theme": "Theme",
    "currency": "Currency",
    "timezone": "Timezone",

    // Settings page
    "appearance": "Appearance",
    "languageRegion": "Language & Region",
    "preferences": "Preferences",
    "account": "Account",

    // Theme options
    "dark": "Dark",
    "light": "Light",
    "system": "System",

    // Language options
    "english": "English",
    "italiano": "Italiano",

    // Currency options
    "usd": "USD ($)",
    "eur": "EUR (€)",
    "gbp": "GBP (£)",

    // Timezone options
    "local": "Local",
    "utc": "UTC",

    // Messages
    "chooseTheme": "Choose how FinanceHub looks on your device",
    "selectLanguage": "Select your preferred language",
    "selectCurrency": "Used for price displays and conversions",
    "selectTimezone": "Time zone for timestamps",
    "settingsStored": "Settings are stored locally on your device",
    "compactMode": "Compact Mode",
    "reduceSpacing": "Reduce spacing in tables and lists",

    // Navigation
    "markets": "Markets",
    "analytics": "Analytics",
    "learn": "Learn",
    "portfolio": "Portfolio",
    "ai": "AI",
    "quantLab": "Quant Lab",
    "back": "Back",
    "home": "Home",

    // Sidebar sections
    "tools": "Tools",
    "personal": "Personal",
    "overview": "Overview",

    // Asset categories
    "stocks": "Stocks",
    "indices": "Indices",
    "etf": "ETFs",
    "crypto": "Crypto",
    "commodities": "Commodities",
    "forex": "Forex",
    "bonds": "Bonds",

    // Heatmap / Screener / News
    "heatmap": "Heatmap",
    "screener": "Screener",
    "watchlist": "Watchlist",
    "news": "News",
    "filters": "Filters",
    "search": "Search",
    "categories": "Categories",
    "sortBy": "Sort By",
    "total": "Total",
    "gainers": "Gainers",
    "losers": "Losers",
    "avgChange": "Avg Change",
    "showAll": "Show All",
    "assets": "Assets",
    "assetClasses": "Asset Classes",
    "resetAll": "Reset All",
    "results": "results",
    "remove": "Remove",
    "name": "Name",
    "price": "Price",
    "dailyChange": "Daily Change",
    "category": "Category",
    "marketCap": "Market Cap",
    "volume": "Volume",
    "noResultsFilter": "No assets match your filters.",
    "myWatchlist": "My Watchlist",
    "emptyWatchlist": "Your Watchlist is Empty",
    "emptyWatchlistDesc": "Start building your watchlist by adding assets from the Markets.",
    "exploreMarkets": "Explore Markets",
    "marketHeatmap": "Market Heatmap",
    "marketScreener": "Market Screener",
    "trackFavorites": "Track your favorite assets and monitor performance.",
    "noAssetsSearch": "No assets match your search.",
    "showingTop": "Showing top",
    "of": "of",
    "allAssets": "assets",
  },
  it: {
    // Header
    "settings": "Impostazioni",
    "profile": "Profilo",
    "signOut": "Esci",
    "language": "Lingua",
    "theme": "Tema",
    "currency": "Valuta",
    "timezone": "Fuso orario",

    // Settings page
    "appearance": "Aspetto",
    "languageRegion": "Lingua e regione",
    "preferences": "Preferenze",
    "account": "Account",

    // Theme options
    "dark": "Scuro",
    "light": "Chiaro",
    "system": "Sistema",

    // Language options
    "english": "English",
    "italiano": "Italiano",

    // Currency options
    "usd": "USD ($)",
    "eur": "EUR (€)",
    "gbp": "GBP (£)",

    // Timezone options
    "local": "Locale",
    "utc": "UTC",

    // Messages
    "chooseTheme": "Scegli come FinanceHub appare sul tuo dispositivo",
    "selectLanguage": "Seleziona la tua lingua preferita",
    "selectCurrency": "Utilizzato per la visualizzazione dei prezzi e le conversioni",
    "selectTimezone": "Fuso orario per i timestamp",
    "settingsStored": "Le impostazioni sono archiviate localmente sul tuo dispositivo",
    "compactMode": "Modalità compatta",
    "reduceSpacing": "Riduci spaziatura in tabelle e elenchi",

    // Navigation
    "markets": "Mercati",
    "analytics": "Analytics",
    "learn": "Impara",
    "portfolio": "Portfolio",
    "ai": "AI",
    "quantLab": "Quant Lab",
    "back": "Indietro",
    "home": "Home",

    // Sidebar sections
    "tools": "Strumenti",
    "personal": "Personale",
    "overview": "Panoramica",

    // Asset categories
    "stocks": "Azioni",
    "indices": "Indici",
    "etf": "ETF",
    "crypto": "Crypto",
    "commodities": "Materie Prime",
    "forex": "Forex",
    "bonds": "Obbligazioni",

    // Heatmap / Screener / News
    "heatmap": "Heatmap",
    "screener": "Screener",
    "watchlist": "Watchlist",
    "news": "Notizie",
    "filters": "Filtri",
    "search": "Cerca",
    "categories": "Categorie",
    "sortBy": "Ordina Per",
    "total": "Totale",
    "gainers": "Rialzisti",
    "losers": "Ribassisti",
    "avgChange": "Var. Media",
    "showAll": "Mostra Tutti",
    "assets": "Asset",
    "assetClasses": "Classi",
    "resetAll": "Reimposta",
    "results": "risultati",
    "remove": "Rimuovi",
    "name": "Nome",
    "price": "Prezzo",
    "dailyChange": "Var. Giornaliera",
    "category": "Categoria",
    "marketCap": "Cap. Mercato",
    "volume": "Volume",
    "noResultsFilter": "Nessun asset corrisponde ai filtri.",
    "myWatchlist": "La Mia Watchlist",
    "emptyWatchlist": "La Tua Watchlist è Vuota",
    "emptyWatchlistDesc": "Inizia aggiungendo asset dai Mercati.",
    "exploreMarkets": "Esplora i Mercati",
    "marketHeatmap": "Heatmap di Mercato",
    "marketScreener": "Screener di Mercato",
    "trackFavorites": "Monitora i tuoi asset preferiti e le loro performance.",
    "noAssetsSearch": "Nessun asset corrisponde alla ricerca.",
    "showingTop": "Mostrando i top",
    "of": "di",
    "allAssets": "asset",
  },
} as const;

export function t(key: keyof (typeof translations)["en"], lang: Language): string {
  return translations[lang][key] ?? key;
}
