export type Language = "en" | "it";
export type Theme = "dark" | "light" | "system";
export type Currency = "USD" | "EUR" | "GBP";
export type Timezone = "local" | "UTC";

export interface AppSettings {
  language: Language;
  theme: Theme;
  currency: Currency;
  timezone: Timezone;
}

export interface SettingsContextType extends AppSettings {
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setCurrency: (currency: Currency) => void;
  setTimezone: (timezone: Timezone) => void;
  resetSettings: () => void;
}
