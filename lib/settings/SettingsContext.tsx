"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { SettingsContextType, Language, Theme, Currency, Timezone } from "./types";
import type { AppSettings } from "./types";
import {
  loadSettings,
  updateLanguage,
  updateTheme,
  updateCurrency,
  updateTimezone,
  resetSettings as resetSettingsStore,
  applyTheme,
  observeSystemThemeChanges,
} from "./settingsStore";

const SettingsContext = createContext<SettingsContextType | null>(null);

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  theme: "system",
  currency: "USD",
  timezone: "local",
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Initialize with defaults immediately — no null state
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load from localStorage on mount and apply theme
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    applyTheme(loaded.theme);
  }, []);

  // Listen to system theme changes if theme is "system"
  useEffect(() => {
    if (settings.theme !== "system") return;

    const unsubscribe = observeSystemThemeChanges(() => {
      applyTheme("system");
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [settings.theme]);

  const handleSetLanguage = (lang: Language) => {
    const updated = updateLanguage(lang);
    setSettings(updated);
  };

  const handleSetTheme = (theme: Theme) => {
    const updated = updateTheme(theme);
    setSettings(updated);
  };

  const handleSetCurrency = (currency: Currency) => {
    const updated = updateCurrency(currency);
    setSettings(updated);
  };

  const handleSetTimezone = (timezone: Timezone) => {
    const updated = updateTimezone(timezone);
    setSettings(updated);
  };

  const handleResetSettings = () => {
    const defaults = resetSettingsStore();
    setSettings(defaults);
  };

  // ALWAYS provide the context — no early return
  const value: SettingsContextType = {
    ...settings,
    setLanguage: handleSetLanguage,
    setTheme: handleSetTheme,
    setCurrency: handleSetCurrency,
    setTimezone: handleSetTimezone,
    resetSettings: handleResetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);

  if (!context) {
    return {
      language: "en",
      theme: "system",
      currency: "USD",
      timezone: "local",
      setLanguage: () => {},
      setTheme: () => {},
      setCurrency: () => {},
      setTimezone: () => {},
      resetSettings: () => {},
    };
  }

  return context;
}
