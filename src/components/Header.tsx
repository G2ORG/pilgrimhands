"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Menu, X, Cross } from "lucide-react";

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
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤲</span>
            <span className="font-serif text-xl font-bold text-crimson-700">
              PilgrimHands
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/tasks" className="text-gray-600 hover:text-crimson-700 transition-colors">
              Задачи
            </Link>
            <Link href="/knights" className="text-gray-600 hover:text-crimson-700 transition-colors">
              Рыцари
            </Link>
            <Link href="/api-docs" className="text-gray-600 hover:text-crimson-700 transition-colors">
              API
            </Link>
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="btn-secondary text-sm px-4 py-2">
                  Кабинет
                </Link>
                <Link href="/tasks/new" className="btn-primary text-sm px-4 py-2">
                  + Задача
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth" className="text-gray-600 hover:text-crimson-700 text-sm font-medium">
                  Войти
                </Link>
                <Link href="/auth?tab=signup" className="btn-primary text-sm px-4 py-2">
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <Link href="/tasks" className="block text-gray-700 py-2">Задачи</Link>
            <Link href="/knights" className="block text-gray-700 py-2">Рыцари</Link>
            <Link href="/api-docs" className="block text-gray-700 py-2">API</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block text-crimson-700 py-2 font-medium">Кабинет</Link>
                <Link href="/tasks/new" className="block btn-primary text-center">+ Создать задачу</Link>
              </>
            ) : (
              <>
                <Link href="/auth" className="block text-gray-700 py-2">Войти</Link>
                <Link href="/auth?tab=signup" className="block btn-primary text-center">Регистрация</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
