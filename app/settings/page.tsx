"use client";

import Link from "next/link";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";
import type { Theme, Language, Currency, Timezone } from "@/lib/settings/types";

export default function SettingsPage() {
  const settings = useSettings();

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Back link */}
      <div className="border-b border-bg-border bg-bg-sidebar px-6 py-4">
        <Link
          href="/markets"
          className="flex items-center gap-2 text-sm text-cyan hover:text-cyan-light"
        >
          ← {t("back", settings.language)}
        </Link>
      </div>

      {/* Settings container */}
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">
          {t("settings", settings.language)}
        </h1>

        {/* Settings sidebar + content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Sidebar navigation */}
          <div className="md:col-span-1">
            <nav className="space-y-2">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                {t("preferences", settings.language)}
              </div>
              <a
                href="#appearance"
                className="block rounded-card px-3 py-2 text-sm text-cyan font-medium bg-cyan-bg/30"
              >
                {t("appearance", settings.language)}
              </a>
              <a
                href="#language"
                className="block rounded-card px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition"
              >
                {t("languageRegion", settings.language)}
              </a>
              <a
                href="#currency"
                className="block rounded-card px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition"
              >
                {t("currency", settings.language)}
              </a>
              <a
                href="#timezone"
                className="block rounded-card px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition"
              >
                {t("timezone", settings.language)}
              </a>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3 mt-6">
                {t("account", settings.language)}
              </div>
              <a
                href="/profile"
                className="block rounded-card px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition"
              >
                {t("profile", settings.language)}
              </a>
            </nav>
          </div>

          {/* Main content */}
          <div className="md:col-span-3 space-y-6">
            {/* Appearance Section */}
            <section
              id="appearance"
              className="rounded-card border border-bg-border bg-bg-card p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                {t("appearance", settings.language)}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">
                    {t("theme", settings.language)}
                  </label>
                  <div className="flex gap-2">
                    {(["dark", "light", "system"] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => settings.setTheme(theme as Theme)}
                        className={`rounded-card px-4 py-2 text-sm font-medium transition ${
                          settings.theme === theme
                            ? "bg-cyan text-bg-primary"
                            : "bg-bg-hover text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {t(theme, settings.language)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    {t("chooseTheme", settings.language)}
                  </p>
                </div>

                <div className="border-t border-bg-border pt-4">
                  <label className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-text-secondary">
                      {t("compactMode", settings.language)}
                    </span>
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      disabled
                    />
                  </label>
                  <p className="text-xs text-text-muted">
                    {t("reduceSpacing", settings.language)}
                  </p>
                </div>
              </div>
            </section>

            {/* Language Section */}
            <section
              id="language"
              className="rounded-card border border-bg-border bg-bg-card p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                {t("languageRegion", settings.language)}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">
                    {t("language", settings.language)}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(["en", "it"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => settings.setLanguage(lang as Language)}
                        className={`rounded-card px-3 py-1.5 text-xs font-medium transition ${
                          settings.language === lang
                            ? "bg-cyan text-bg-primary"
                            : "bg-bg-hover text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {t(lang === "en" ? "english" : "italiano", settings.language)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    {t("selectLanguage", settings.language)}
                  </p>
                </div>
              </div>
            </section>

            {/* Currency Section */}
            <section
              id="currency"
              className="rounded-card border border-bg-border bg-bg-card p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                {t("currency", settings.language)}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">
                    {t("currency", settings.language)}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(["USD", "EUR", "GBP"] as const).map((currency) => (
                      <button
                        key={currency}
                        onClick={() => settings.setCurrency(currency as Currency)}
                        className={`rounded-card px-3 py-1.5 text-xs font-medium transition ${
                          settings.currency === currency
                            ? "bg-cyan text-bg-primary"
                            : "bg-bg-hover text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {t(currency.toLowerCase() as "usd" | "eur" | "gbp", settings.language)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    {t("selectCurrency", settings.language)}
                  </p>
                </div>
              </div>
            </section>

            {/* Timezone Section */}
            <section
              id="timezone"
              className="rounded-card border border-bg-border bg-bg-card p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                {t("timezone", settings.language)}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">
                    {t("timezone", settings.language)}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(["local", "UTC"] as const).map((tz) => (
                      <button
                        key={tz}
                        onClick={() => settings.setTimezone(tz as Timezone)}
                        className={`rounded-card px-3 py-1.5 text-xs font-medium transition ${
                          settings.timezone === tz
                            ? "bg-cyan text-bg-primary"
                            : "bg-bg-hover text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {t(tz.toLowerCase() as "local" | "utc", settings.language)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    {t("selectTimezone", settings.language)}
                  </p>
                </div>
              </div>
            </section>

            {/* Info box */}
            <div className="rounded-card border border-bg-border bg-cyan-bg/10 p-4">
              <p className="text-xs text-text-muted">
                {t("settingsStored", settings.language)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
