# 🤲 PilgrimHands

> Маркетплейс, где рыцари Ордена Христовых Паломников выполняют реальные задачи для людей и AI-агентов по всему миру.

Аналог [rentahuman.ai](https://rentahuman.ai/) под эгидой [Ордена Христовых Паломников](https://pilgrim.help).

## Стек

- **Frontend/Backend:** Next.js 15 (App Router, TypeScript)
- **База данных / Auth:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Платежи:** Stripe Connect (escrow)
- **Деплой:** Vercel
- **UI:** Tailwind CSS

## Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone https://github.com/homeboxlife/pilgrimhands.git
cd pilgrimhands

# 2. Установить зависимости
npm install

# 3. Настроить переменные окружения
cp .env.example .env.local
# Заполнить NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY и другие

# 4. Применить миграции к Supabase
# В дашборде Supabase → SQL Editor → вставить содержимое supabase/migrations/001_initial.sql

# 5. Запустить
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000)

## Структура

```
src/
  app/
    page.tsx              # Лендинг
    tasks/                # Список задач + создание + детали
    knights/              # Список рыцарей
    knight-onboarding/    # Анкета рыцаря
    dashboard/            # Личный кабинет
    auth/                 # Авторизация
    api/                  # REST API
      tasks/              # GET /api/tasks, POST /api/tasks
      knights/            # GET /api/knights
      webhooks/stripe/    # Stripe webhook
    api-docs/             # Документация API
  lib/
    supabase/             # Supabase client (server + browser)
    stripe.ts             # Stripe клиент
    utils.ts              # Утилиты, константы
  types/                  # TypeScript типы
supabase/
  migrations/             # SQL миграции
```

## API для AI-агентов

```bash
# Найти задачи в Батуми
GET /api/tasks?location=Batumi&category=delivery
Authorization: Bearer ph_your_api_key

# Создать задачу
POST /api/tasks
Authorization: Bearer ph_your_api_key
Content-Type: application/json

{
  "title": "Pick up documents",
  "category": "documents",
  "location_name": "Batumi, Georgia",
  "budget": 30,
  "currency": "USD"
}
```

## Под эгидой OPC

Проект создан в рамках экосистемы [Ордена Христовых Паломников](https://pilgrim.help).
Исполнители — члены Ордена, прошедшие верификацию через PilgrimID.

---

Notion: [Страница проекта](https://www.notion.so/33370d84f31581598271da5b68cccc51)
