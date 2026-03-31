"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
      borderBottom: '1px solid #3a2f1a',
      backgroundColor: 'rgba(6,4,2,0.95)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem' }}>🤲</span>
            <span style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#c9952a',
              letterSpacing: '0.05em'
            }}>
              PilgrimHands
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden md:flex">
            {[
              { href: '/tasks', label: 'Tasks' },
              { href: '/knights', label: 'Knights' },
              { href: '/api-docs', label: 'API' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                color: '#c0a880',
                textDecoration: 'none',
                fontFamily: "'Cinzel', serif",
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.3s'
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c9952a')}
              onMouseLeave={e => (e.currentTarget.style.color = '#c0a880')}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden md:flex">
            {user ? (
              <>
                <Link href="/dashboard" className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                  Cabinet
                </Link>
                <Link href="/tasks/new" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                  + Post Task
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth" style={{
                  color: '#c0a880',
                  textDecoration: 'none',
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em'
                }}>
                  Sign In
                </Link>
                <Link href="/auth?tab=signup" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                  Join
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            style={{ color: '#c0a880', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid #3a2f1a',
            padding: '1rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }} className="md:hidden">
            <Link href="/tasks" style={{ color: '#c0a880', fontFamily: "'Cinzel', serif", fontSize: '0.85rem', textDecoration: 'none' }}>Tasks</Link>
            <Link href="/knights" style={{ color: '#c0a880', fontFamily: "'Cinzel', serif", fontSize: '0.85rem', textDecoration: 'none' }}>Knights</Link>
            <Link href="/api-docs" style={{ color: '#c0a880', fontFamily: "'Cinzel', serif", fontSize: '0.85rem', textDecoration: 'none' }}>API</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="btn-secondary" style={{ textAlign: 'center' }}>Cabinet</Link>
                <Link href="/tasks/new" className="btn-primary" style={{ textAlign: 'center' }}>+ Post Task</Link>
              </>
            ) : (
              <>
                <Link href="/auth" style={{ color: '#c0a880', fontFamily: "'Cinzel', serif", fontSize: '0.85rem', textDecoration: 'none' }}>Sign In</Link>
                <Link href="/auth?tab=signup" className="btn-primary" style={{ textAlign: 'center' }}>Join the Order</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
