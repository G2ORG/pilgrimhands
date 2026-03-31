"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";

  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push(redirectTo);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess("Check your email and confirm your address.");
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}` },
    });
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🤲</span>
            <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.4rem', color: '#c9952a' }}>PilgrimHands</span>
          </Link>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', color: '#c9952a' }}>
            {tab === "login" ? "Sign In" : "Create Account"}
          </h1>
        </div>

        <div className="card">
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#060402', border: '1px solid #3a2f1a', marginBottom: '1.5rem' }}>
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '0.6rem',
                  fontFamily: "'Cinzel', serif", fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: tab === t ? 'rgba(201,149,42,0.15)' : 'transparent',
                  color: tab === t ? '#c9952a' : '#7a6a50',
                  border: 'none', cursor: 'pointer',
                  borderBottom: tab === t ? '2px solid #c9952a' : '2px solid transparent',
                }}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              border: '1px solid #3a2f1a', background: 'transparent', color: '#c0a880',
              padding: '0.75rem', cursor: 'pointer', marginBottom: '1rem',
              fontFamily: "'Cinzel', serif", fontSize: '0.8rem', letterSpacing: '0.05em',
              transition: 'border-color 0.3s',
            }}
          >
            <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#3a2f1a' }} />
            <span style={{ color: '#7a5c1a', fontSize: '0.75rem', fontFamily: "'Share Tech Mono', monospace" }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#3a2f1a' }} />
          </div>

          <form onSubmit={tab === "login" ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tab === "signup" && (
              <div>
                <label className="label">Name</label>
                <input
                  type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Pilgrim"
                  className="input-field"
                />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password" required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            {error && (
              <p style={{ color: '#cc4444', fontSize: '0.85rem', background: 'rgba(139,26,26,0.2)', padding: '0.5rem 0.75rem', border: '1px solid #8b1a1a' }}>
                {error}
              </p>
            )}
            {success && (
              <p style={{ color: '#6ab86a', fontSize: '0.85rem', background: 'rgba(74,124,74,0.2)', padding: '0.5rem 0.75rem', border: '1px solid #2a5a2a' }}>
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? "..." : tab === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a6a50' }}>
        Loading...
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
