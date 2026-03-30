import Link from "next/link";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/utils";
import type { TaskCategory } from "@/types";

const CATEGORIES: TaskCategory[] = [
  "pilgrimage", "delivery", "photography", "documents",
  "tech", "research", "representation", "other",
];

const STATS = [
  { label: "Рыцарей Ордена", value: "50+" },
  { label: "Стран присутствия", value: "12" },
  { label: "Задач выполнено", value: "0" },
  { label: "Комиссия платформы", value: "15%" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-crimson-900 via-crimson-700 to-crimson-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <span>⚔️</span>
            <span>Под эгидой Ордена Христовых Паломников</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Рыцари для ваших<br />реальных задач
          </h1>
          <p className="text-xl text-crimson-100 max-w-2xl mx-auto mb-10">
            PilgrimHands соединяет вас с проверенными рыцарями Ордена по всему миру.
            Паломничество, доставка, документы, исследование — и многое другое.
            Для людей и AI-агентов.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tasks/new" className="bg-gold-400 hover:bg-gold-500 text-crimson-900 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Создать задачу
            </Link>
            <Link href="/knight-onboarding" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-8 py-4 rounded-lg text-lg transition-colors">
              Стать рыцарем
            </Link>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1200 40 240 40 0 0L0 60Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-crimson-700 font-serif">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center text-gray-900 mb-10">
            Категории задач
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/tasks?category=${cat}`}
                className="card hover:border-crimson-300 hover:shadow-md transition-all text-center group"
              >
                <div className="text-3xl mb-2">{CATEGORY_ICONS[cat]}</div>
                <div className="font-medium text-gray-800 group-hover:text-crimson-700 transition-colors">
                  {CATEGORY_LABELS[cat]}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-serif text-3xl font-bold text-center text-gray-900 mb-12">
          Как это работает
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              step: "01",
              title: "Создайте задачу",
              desc: "Опишите что нужно сделать, укажите место, бюджет и дедлайн. Занимает 2 минуты.",
              icon: "📝",
            },
            {
              step: "02",
              title: "Получите предложения",
              desc: "Рыцари Ордена из вашего региона откликнутся с ценой и сроками. Выберите лучшее.",
              icon: "⚔️",
            },
            {
              step: "03",
              title: "Задача выполнена",
              desc: "Оплата удерживается на эскроу до завершения. Рыцарь получает выплату после вашего подтверждения.",
              icon: "✅",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="text-5xl mb-4">{item.icon}</div>
              <div className="text-xs font-bold text-crimson-500 tracking-widest uppercase mb-2">
                Шаг {item.step}
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Agent section */}
      <section className="bg-crimson-50 border-y border-crimson-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="font-serif text-3xl font-bold text-crimson-900 mb-4">
            Для AI-агентов
          </h2>
          <p className="text-crimson-700 text-lg mb-8">
            Ваш AI-агент может нанимать рыцарей напрямую через REST API или MCP Server.
            Поиск исполнителей, назначение задач, управление оплатой — всё через API.
          </p>
          <div className="bg-crimson-900 rounded-xl p-6 text-left mb-6 font-mono text-sm text-green-300">
            <div className="text-gray-400 mb-2"># Найти доступных рыцарей</div>
            <div>GET /api/knights?category=delivery&location=Batumi</div>
            <div className="text-gray-400 mt-4 mb-2"># Создать задачу</div>
            <div>POST /api/tasks</div>
            <div className="text-gray-500 pl-4">{'{"title":"Pick up documents","budget":50,"currency":"USD"}'}</div>
          </div>
          <Link href="/api-docs" className="btn-primary inline-block">
            Документация API →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">
          Готовы начать?
        </h2>
        <p className="text-gray-500 text-lg mb-8">
          Создайте задачу за 2 минуты или вступите в Орден как рыцарь.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/tasks/new" className="btn-primary text-lg px-8 py-4">
            Создать задачу
          </Link>
          <Link href="/knight-onboarding" className="btn-secondary text-lg px-8 py-4">
            Присоединиться как рыцарь
          </Link>
        </div>
      </section>
    </div>
  );
}
