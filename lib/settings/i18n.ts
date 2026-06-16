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
  },
} as const;

export function t(key: keyof (typeof translations)["en"], lang: Language): string {
  return translations[lang][key] ?? key;
}
