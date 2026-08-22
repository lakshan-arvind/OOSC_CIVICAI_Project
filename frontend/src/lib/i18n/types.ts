export type Locale = "en" | "hi" | "ta";

export const LOCALES: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
];

export const LOCALE_STORAGE_KEY = "civicai_locale";

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "hi" || value === "ta";
}
