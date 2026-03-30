"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/utils";
import type { TaskCategory } from "@/types";
import { z } from "zod";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TaskCategory[];
const CURRENCIES = ["USD", "EUR", "GEL"];

const taskSchema = z.object({
  title: z.string().min(5, "Минимум 5 символов").max(200),
  description: z.string().min(10, "Минимум 10 символов").optional(),
  category: z.enum(["pilgrimage", "delivery", "photography", "documents", "tech", "research", "representation", "other"]),
  location_name: z.string().optional(),
  is_remote: z.boolean(),
  budget: z.number().positive().optional().nullable(),
  currency: z.string(),
  deadline: z.string().optional(),
});

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other" as TaskCategory,
    location_name: "",
    is_remote: false,
    budget: "",
    currency: "USD",
    deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth?redirectTo=/tasks/new");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      category: form.category,
      location_name: form.location_name || null,
      is_remote: form.is_remote,
      budget: form.budget ? parseFloat(form.budget) : null,
      currency: form.currency,
      deadline: form.deadline || null,
      client_id: user.id,
      status: "open",
      visibility: "public",
    };

    const { data, error: dbError } = await supabase
      .from("tasks")
      .insert(payload)
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    router.push(`/tasks/${data.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Создать задачу</h1>
        <p className="text-gray-500 mt-2">
          Опишите что нужно сделать и рыцари Ордена откликнутся с предложениями.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название задачи *
          </label>
          <input
            type="text"
            required
            minLength={5}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Например: Встретить паломников в аэропорту Тбилиси"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Подробности задачи: что именно нужно сделать, особые требования..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Категория *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                className={`p-3 rounded-lg border text-sm text-center transition-colors ${
                  form.category === cat
                    ? "border-crimson-600 bg-crimson-50 text-crimson-700 font-medium"
                    : "border-gray-200 hover:border-crimson-300"
                }`}
              >
                <div className="text-xl mb-1">{CATEGORY_ICONS[cat]}</div>
                <div>{CATEGORY_LABELS[cat]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Location / Remote */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm font-medium text-gray-700">Формат</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_remote}
                onChange={(e) => setForm({ ...form, is_remote: e.target.checked })}
                className="w-4 h-4 accent-crimson-600"
              />
              <span className="text-sm text-gray-600">Удалённо (без привязки к месту)</span>
            </label>
          </div>
          {!form.is_remote && (
            <input
              type="text"
              value={form.location_name}
              onChange={(e) => setForm({ ...form, location_name: e.target.value })}
              placeholder="Город / адрес, например: Батуми, Грузия"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Budget */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Бюджет
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
            />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Валюта
            </label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дедлайн
          </label>
          <input
            type="datetime-local"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Публикуем..." : "Опубликовать задачу →"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Публикуя задачу, вы соглашаетесь с{" "}
          <a href="/terms" className="text-crimson-600 hover:underline">
            условиями использования
          </a>
          . Оплата удерживается на эскроу до завершения.
        </p>
      </form>
    </div>
  );
}
