import type { AppSettings, Language, Theme, Currency, Timezone } from "./types";

const STORAGE_KEY = "finlearn:settings";

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  theme: "system",
  currency: "USD",
  timezone: "local",
};

export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored) as Partial<AppSettings>;
    // Merge with defaults to ensure all keys exist
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.error("Failed to load settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export function updateLanguage(lang: Language): AppSettings {
  const current = loadSettings();
  const updated = { ...current, language: lang };
  saveSettings(updated);
  return updated;
}

export function updateTheme(theme: Theme): AppSettings {
  const current = loadSettings();
  const updated = { ...current, theme };
  saveSettings(updated);
  applyTheme(theme);
  return updated;
}

export function updateCurrency(currency: Currency): AppSettings {
  const current = loadSettings();
  const updated = { ...current, currency };
  saveSettings(updated);
  return updated;
}

export function updateTimezone(timezone: Timezone): AppSettings {
  const current = loadSettings();
  const updated = { ...current, timezone };
  saveSettings(updated);
  return updated;
}

export function resetSettings(): AppSettings {
  saveSettings(DEFAULT_SETTINGS);
  applyTheme(DEFAULT_SETTINGS.theme);
  return DEFAULT_SETTINGS;
}

/**
 * Apply theme to document.
 * "system" uses prefers-color-scheme media query.
 * "light" / "dark" force the theme.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  const isDarkPreferred =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : theme === "dark";

  // CSS uses html.light for light mode; :root is the dark default
  if (!isDarkPreferred) {
    html.classList.add("light");
  } else {
    html.classList.remove("light");
  }
}

/**
 * Listen to prefers-color-scheme changes when theme is "system".
 */
export function observeSystemThemeChanges(
  callback: (isDark: boolean) => void
): (() => void) | null {
  if (typeof window === "undefined") return null;

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  mediaQuery.addEventListener("change", handler);

  return () => mediaQuery.removeEventListener("change", handler);
}
