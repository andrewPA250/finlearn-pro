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

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate settings from localStorage on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    // Apply theme immediately
    applyTheme(loaded.theme);
    setIsHydrated(true);
  }, []);

  // Listen to system theme changes if theme is "system"
  useEffect(() => {
    if (!settings || settings.theme !== "system") return;

    const unsubscribe = observeSystemThemeChanges(() => {
      // Re-apply theme based on system preference
      applyTheme("system");
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [settings]);

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

  // During SSR, return null to prevent hydration mismatch
  if (!isHydrated || !settings) {
    return <>{children}</>;
  }

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

  // During SSR/static generation, return default settings if context is not available
  if (!context) {
    // Return a safe default object that won't throw
    const defaultContext: SettingsContextType = {
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
    return defaultContext;
  }

  return context;
}
