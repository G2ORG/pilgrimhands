"use client";

import { useLang } from "@/contexts/LangContext";
import { LANGS } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div style={{
      display: 'flex', gap: '2px',
    }}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px',
            letterSpacing: '1.5px',
            background: lang === code ? '#c9952a' : 'transparent',
            border: '1px solid',
            borderColor: lang === code ? '#c9952a' : '#7a5c1a',
            color: lang === code ? '#060402' : '#7a5c1a',
            padding: '3px 8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            if (lang !== code) {
              (e.target as HTMLButtonElement).style.borderColor = '#c9952a';
              (e.target as HTMLButtonElement).style.color = '#c9952a';
            }
          }}
          onMouseLeave={(e) => {
            if (lang !== code) {
              (e.target as HTMLButtonElement).style.borderColor = '#7a5c1a';
              (e.target as HTMLButtonElement).style.color = '#7a5c1a';
            }
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
