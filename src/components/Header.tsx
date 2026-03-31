"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLang } from "@/contexts/LangContext";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLang();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <header style={{
      borderBottom: '1px solid rgba(201,149,42,0.2)',
      background: 'linear-gradient(180deg, rgba(6,4,2,0.97), rgba(6,4,2,0.82))',
      backdropFilter: 'blur(8px)',
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 1000,
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.3rem' }}>🤲</span>
            <span style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: '12px', fontWeight: 700,
              color: '#c9952a', letterSpacing: '3px',
              textShadow: '0 0 10px rgba(201,149,42,0.35)',
            }}>
              PilgrimHands
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {[
              { href: '/tasks', key: 'nav_tasks' },
              { href: '/knights', key: 'nav_knights' },
              { href: '/api-docs', key: 'nav_api' },
            ].map(({ href, key }) => (
              <Link key={href} href={href} style={{
                color: '#7a6a50', textDecoration: 'none',
                fontFamily: "'Cinzel', serif", fontSize: '10px',
                letterSpacing: '3px', textTransform: 'uppercase', transition: 'color 0.3s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c9952a')}
              onMouseLeave={e => (e.currentTarget.style.color = '#7a6a50')}
              >
                {t(key)}
              </Link>
            ))}

            <div style={{ width: '1px', height: '16px', background: '#3a2f1a' }} />
            <LanguageSwitcher />
            <div style={{ width: '1px', height: '16px', background: '#3a2f1a' }} />

            {/* Auth buttons */}
            {user ? (
              <>
                <Link href="/dashboard" style={{
                  color: '#7a6a50', textDecoration: 'none',
                  fontFamily: "'Cinzel', serif", fontSize: '10px',
                  letterSpacing: '2px', textTransform: 'uppercase',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c9952a')}
                onMouseLeave={e => (e.currentTarget.style.color = '#7a6a50')}
                >
                  {t('nav_cabinet')}
                </Link>
                <Link href="/tasks/new" className="btn-primary" style={{ padding: '0.35rem 1rem', fontSize: '0.72rem' }}>
                  {t('nav_postTask')}
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth" style={{
                  color: '#7a6a50', textDecoration: 'none',
                  fontFamily: "'Cinzel', serif", fontSize: '10px',
                  letterSpacing: '2px', textTransform: 'uppercase',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c9952a')}
                onMouseLeave={e => (e.currentTarget.style.color = '#7a6a50')}
                >
                  {t('nav_signIn')}
                </Link>
                <Link href="/auth?tab=signup" className="btn-primary" style={{ padding: '0.35rem 1rem', fontSize: '0.72rem' }}>
                  {t('nav_join')}
                </Link>
              </>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            style={{ color: '#c0a880', background: 'none', border: 'none', cursor: 'pointer', display: 'none' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid #3a2f1a', padding: '1rem 0',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
          }}>
            <Link href="/tasks" onClick={() => setMenuOpen(false)} style={{ color: '#c0a880', fontFamily: "'Cinzel', serif", fontSize: '0.85rem', textDecoration: 'none' }}>{t('nav_tasks')}</Link>
            <Link href="/knights" onClick={() => setMenuOpen(false)} style={{ color: '#c0a880', fontFamily: "'Cinzel', serif", fontSize: '0.85rem', textDecoration: 'none' }}>{t('nav_knights')}</Link>
            <Link href="/api-docs" onClick={() => setMenuOpen(false)} style={{ color: '#c0a880', fontFamily: "'Cinzel', serif", fontSize: '0.85rem', textDecoration: 'none' }}>{t('nav_api')}</Link>
            <LanguageSwitcher />
            {user ? (
              <>
                <Link href="/dashboard" className="btn-secondary" style={{ textAlign: 'center' }}>{t('nav_cabinet')}</Link>
                <Link href="/tasks/new" className="btn-primary" style={{ textAlign: 'center' }}>{t('nav_postTask')}</Link>
              </>
            ) : (
              <>
                <Link href="/auth" style={{ color: '#c0a880', fontFamily: "'Cinzel', serif", fontSize: '0.85rem', textDecoration: 'none' }}>{t('nav_signIn')}</Link>
                <Link href="/auth?tab=signup" className="btn-primary" style={{ textAlign: 'center' }}>{t('nav_join')}</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
