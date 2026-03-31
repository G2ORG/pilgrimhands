---
name: PilgrimHands — маркетплейс задач Ордена
description: Маркетплейс где рыцари OPC выполняют задачи для людей и AI-агентов, аналог rentahuman.ai
type: project
---

**PilgrimHands** — маркетплейс задач Ордена Христовых Паломников (аналог rentahuman.ai).

**Код:** `C:\Claude Code folder\pilgrimhands\`
**Git:** локальный репозиторий, нужно создать remote `github.com/homeboxlife/pilgrimhands`
**Notion:** https://www.notion.so/33370d84f31581598271da5b68cccc51

**Стек:** Next.js 15, Supabase, Stripe Connect, Vercel, Tailwind v4
**Статус:** MVP готов, build проходит ✅

**Для запуска:**
1. Создать проект Supabase → применить `supabase/migrations/001_initial.sql`
2. Заполнить `.env.local` (есть `.env.example`)
3. Создать Stripe аккаунт + webhook
4. `npm run dev`

**Для деплоя:**
1. Создать GitHub репо `homeboxlife/pilgrimhands`
2. Подключить к Vercel
3. Заполнить env vars в Vercel Dashboard

**Why:** Новый проект OPC, запущен 2026-03-30.
**How to apply:** При работе с этим проектом — Next.js App Router + Supabase SSR паттерн.
