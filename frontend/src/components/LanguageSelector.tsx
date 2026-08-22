"use client";

import { LOCALES } from "@/lib/i18n/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-stone-600">
      <span className="sr-only">{t.language}</span>
      <span aria-hidden className="hidden sm:inline">
        {t.language}:
      </span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className="min-h-9 rounded-md border border-stone-300 bg-white px-2 py-1 text-sm text-stone-800 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        aria-label={t.language}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
