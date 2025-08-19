"use client";
import { useLanguage } from "../contexts/LanguageContext";

export default function TranslateButton() {
  const { isArabic, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex items-center justify-center rounded-md border border-border p-2 text-muted-foreground hover:bg-accent/10 mb-4"
    >
      {isArabic ? "English" : "العربية"}
    </button>
  );
}