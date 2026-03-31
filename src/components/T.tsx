"use client";

import { useLang } from "@/contexts/LangContext";

/**
 * Translation component for use inside server components.
 * Renders the translated string for the current language.
 * Falls back to `f` (English fallback) during SSR.
 */
export function T({ k, f }: { k: string; f?: string }) {
  const { t } = useLang();
  const text = t(k);
  return <>{text || f || k}</>;
}
