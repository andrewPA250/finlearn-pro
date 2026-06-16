"use client";

import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark");
  const [currency, setCurrency] = useState("usd");

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Back link */}
      <div className="border-b border-bg-border bg-bg-sidebar px-6 py-4">
        <Link href="/markets" className="flex items-center gap-2 text-sm text-cyan hover:text-cyan-light">
          ← Back to Markets
        </Link>
      </div>

      {/* Settings container */}
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Settings</h1>

        {/* Settings sidebar + content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Sidebar navigation */}
          <div className="md:col-span-1">
            <nav className="space-y-2">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                Preferences
              </div>
              <a
                href="#appearance"
                className="block rounded-card px-3 py-2 text-sm text-cyan font-medium bg-cyan-bg/30"
              >
                Appearance
              </a>
              <a
                href="#language"
                className="block rounded-card px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition"
              >
                Language & Region
              </a>
              <a
                href="#currency"
                className="block rounded-card px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition"
              >
                Currency
              </a>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3 mt-6">
                Account
              </div>
              <a
                href="/profile"
                className="block rounded-card px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition"
              >
                Profile
              </a>
            </nav>
          </div>

          {/* Main content */}
          <div className="md:col-span-3 space-y-6">
            {/* Appearance Section */}
            <section id="appearance" className="rounded-card border border-bg-border bg-bg-card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Appearance</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">Theme</label>
                  <div className="flex gap-2">
                    {[
                      { value: "light", label: "Light" },
                      { value: "dark", label: "Dark", active: true },
                      { value: "auto", label: "Auto" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`rounded-card px-4 py-2 text-sm font-medium transition ${
                          theme === option.value
                            ? "bg-cyan text-bg-primary"
                            : "bg-bg-hover text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2">Choose how FinanceHub looks on your device</p>
                </div>

                <div className="border-t border-bg-border pt-4">
                  <label className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-text-secondary">Compact Mode</span>
                    <input type="checkbox" className="w-4 h-4" />
                  </label>
                  <p className="text-xs text-text-muted">Reduce spacing in tables and lists</p>
                </div>
              </div>
            </section>

            {/* Language Section */}
            <section id="language" className="rounded-card border border-bg-border bg-bg-card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Language & Region</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">Language</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: "en", label: "English" },
                      { value: "it", label: "Italiano" },
                      { value: "es", label: "Español" },
                      { value: "de", label: "Deutsch" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setLanguage(option.value)}
                        className={`rounded-card px-3 py-1.5 text-xs font-medium transition ${
                          language === option.value
                            ? "bg-cyan text-bg-primary"
                            : "bg-bg-hover text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2">Select your preferred language</p>
                </div>
              </div>
            </section>

            {/* Currency Section */}
            <section id="currency" className="rounded-card border border-bg-border bg-bg-card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Currency</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">Default Currency</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: "usd", label: "USD ($)" },
                      { value: "eur", label: "EUR (€)" },
                      { value: "gbp", label: "GBP (£)" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setCurrency(option.value)}
                        className={`rounded-card px-3 py-1.5 text-xs font-medium transition ${
                          currency === option.value
                            ? "bg-cyan text-bg-primary"
                            : "bg-bg-hover text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2">Used for price displays and conversions</p>
                </div>
              </div>
            </section>

            {/* Info box */}
            <div className="rounded-card border border-bg-border bg-cyan-bg/10 p-4">
              <p className="text-xs text-text-muted">
                Settings are stored locally on your device. Account-level preferences will be added in Phase 2.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
