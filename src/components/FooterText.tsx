"use client";

import { useLang } from "@/contexts/LangContext";

export function FooterText() {
  const { t } = useLang();
  return (
    <p style={{ color: '#7a6a50', fontSize: '0.85rem', fontFamily: "'Share Tech Mono', monospace" }}>
      PilgrimHands ·{' '}
      <a href="https://pilgrim.help" style={{ color: '#c9952a' }} target="_blank" rel="noopener noreferrer">
        {t('footer_sub')}
      </a>
    </p>
  );
}
