"use client";

import Link from "next/link";
import { CATEGORY_ICONS } from "@/lib/utils";
import { CATEGORY_LABELS_I18N } from "@/lib/i18n";
import { useLang } from "@/contexts/LangContext";
import type { TaskCategory } from "@/types";

const CATEGORIES: TaskCategory[] = [
  "pilgrimage", "delivery", "photography", "documents",
  "tech", "research", "representation", "other",
];

export default function Home() {
  const { t, lang } = useLang();
  const catLabels = CATEGORY_LABELS_I18N[lang];

  const STATS = [
    { label: t('stats_knights_order'), value: "50+" },
    { label: t('stats_countries_covered'), value: "12" },
    { label: t('stats_tasks'), value: "0" },
    { label: t('stats_commission'), value: "15%" },
  ];

  const HOW_IT_WORKS = [
    { step: "I",   icon: "📜", title: t('chapter1_title'), desc: t('chapter1_text') },
    { step: "II",  icon: "⚔️", title: t('chapter2_title'), desc: t('chapter2_text') },
    { step: "III", icon: "✝️", title: t('chapter3_title'), desc: t('chapter3_text') },
  ];

  return (
    <div style={{ backgroundColor: '#060402' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'radial-gradient(ellipse at center, #1a0e04 0%, #060402 70%)',
        padding: '6rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle, #c9952a 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(201,149,42,0.1)', border: '1px solid #7a5c1a',
            padding: '6px 16px', marginBottom: '2rem',
            fontFamily: "'Share Tech Mono', monospace", fontSize: '0.8rem', color: '#c9952a',
          }}>
            ⚔️ {t('hero_badge')}
          </div>

          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            color: '#c9952a',
            lineHeight: 1.2,
            marginBottom: '1.5rem',
            textShadow: '0 0 40px rgba(201,149,42,0.3)',
            whiteSpace: 'pre-line',
          }}>
            {t('hero_title')}
          </h1>

          <p style={{
            fontFamily: "'IM Fell English', serif",
            fontSize: '1.15rem',
            color: '#d4b896',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
            fontStyle: 'italic',
          }}>
            {t('hero_sub')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/tasks/new" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.85rem 2rem' }}>
              {t('hero_cta_post')}
            </Link>
            <Link href="/knight-onboarding" className="btn-secondary" style={{ fontSize: '0.9rem', padding: '0.85rem 2rem' }}>
              {t('hero_cta_become')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: '#3a2f1a' }}
          className="sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} style={{
              background: '#060402', padding: '2rem 1rem', textAlign: 'center',
            }}>
              <div style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: '2.2rem', fontWeight: 700, color: '#c9952a',
                textShadow: '0 0 20px rgba(201,149,42,0.4)',
              }}>
                {stat.value}
              </div>
              <div style={{ color: '#7a6a50', fontSize: '0.8rem', fontFamily: "'Share Tech Mono', monospace", marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={{ background: '#0a0805', padding: '4rem 1.5rem', borderTop: '1px solid #3a2f1a', borderBottom: '1px solid #3a2f1a' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="divider" style={{ maxWidth: '300px', margin: '0 auto 2.5rem' }}>
            <span style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              {t('categories_title')}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
            className="sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat} href={`/tasks?category=${cat}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{CATEGORY_ICONS[cat]}</div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.8rem', color: '#c0a880', letterSpacing: '0.05em' }}>
                    {catLabels[cat]}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div className="divider" style={{ maxWidth: '300px', margin: '0 auto 3rem' }}>
          <span style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {t('how_title')}
          </span>
        </div>
        <div style={{ display: 'grid', gap: '2rem' }} className="md:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
              <div style={{
                fontFamily: "'Cinzel Decorative', serif",
                color: '#7a5c1a', fontSize: '0.85rem', letterSpacing: '0.2em',
                marginBottom: '0.5rem',
              }}>
                {t('chapter')} {item.step}
              </div>
              <h3 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                {item.title}
              </h3>
              <p style={{ color: '#7a6a50', lineHeight: 1.7, fontStyle: 'italic' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Agent section ── */}
      <section style={{
        background: '#0a0805', borderTop: '1px solid #3a2f1a', borderBottom: '1px solid #3a2f1a',
        padding: '4rem 1.5rem',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
          <h2 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '1.6rem', marginBottom: '1rem' }}>
            {t('ai_for_agents')}
          </h2>
          <p style={{ color: '#d4b896', fontSize: '1rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.5rem' }}>
            {t('ai_text_home')}
          </p>
          <div style={{
            background: '#060402', border: '1px solid #3a2f1a',
            padding: '1.25rem 1.5rem', textAlign: 'left', marginBottom: '1.5rem',
            fontFamily: "'Share Tech Mono', monospace", fontSize: '0.8rem', color: '#c9952a',
          }}>
            <div style={{ color: '#7a5c1a', marginBottom: '6px' }}># Find available knights</div>
            <div>GET /api/knights?category=delivery&location=Batumi</div>
            <div style={{ color: '#7a5c1a', marginTop: '12px', marginBottom: '6px' }}># Post a task</div>
            <div>POST /api/tasks</div>
            <div style={{ color: '#7a6a50', paddingLeft: '1rem' }}>
              {'{"title":"Pick up documents","budget":50}'}
            </div>
          </div>
          <Link href="/api-docs" className="btn-primary">
            {t('ai_docs')} →
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#c9952a', fontSize: '2rem', marginBottom: '1rem' }}>
          {t('cta_ready')}
        </h2>
        <p style={{ color: '#7a6a50', fontStyle: 'italic', marginBottom: '2rem', lineHeight: 1.7 }}>
          {t('cta_sub')}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/tasks/new" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.85rem 2rem' }}>
            {t('hero_cta_post')}
          </Link>
          <Link href="/knight-onboarding" className="btn-secondary" style={{ fontSize: '0.9rem', padding: '0.85rem 2rem' }}>
            {t('cta_join')}
          </Link>
        </div>
      </section>

    </div>
  );
}
