"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS_I18N, CATEGORY_ICONS } from "@/lib/utils";
import type { TaskCategory } from "@/types";
import { z } from "zod";
import { useLang } from "@/contexts/LangContext";

const CATEGORIES = Object.keys(CATEGORY_LABELS_I18N.en) as TaskCategory[];
const CURRENCIES = ["USD", "EUR", "GEL"];

const taskSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).optional(),
  category: z.enum(["pilgrimage", "delivery", "photography", "documents", "tech", "research", "representation", "other"]),
  location_name: z.string().optional(),
  is_remote: z.boolean(),
  budget: z.number().positive().optional().nullable(),
  currency: z.string(),
  deadline: z.string().optional(),
});

export default function NewTaskPage() {
  const router = useRouter();
  const { t, lang } = useLang();
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

    const { data, error: dbError } = await supabase.from("tasks").insert(payload).select().single();

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    router.push(`/tasks/${data.id}`);
  };

  const categoryLabels = CATEGORY_LABELS_I18N[lang] ?? CATEGORY_LABELS_I18N.en;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.8rem', color: '#c9952a', marginBottom: '0.5rem' }}>
          {t('newTask_title')}
        </h1>
        <p style={{ color: '#7a6a50', fontStyle: 'italic' }}>
          {t('newTask_sub')}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Title */}
        <div>
          <label className="label">{t('label_title')}</label>
          <input
            type="text" required minLength={5}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t('label_title_ph')}
            className="input-field"
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">{t('label_desc')}</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={t('label_desc_ph')}
            className="input-field"
            style={{ resize: 'none' }}
          />
        </div>

        {/* Category */}
        <div>
          <label className="label">{t('label_category')}</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                style={{
                  padding: '0.75rem 0.5rem', textAlign: 'center',
                  border: `1px solid ${form.category === cat ? '#c9952a' : '#3a2f1a'}`,
                  background: form.category === cat ? 'rgba(201,149,42,0.15)' : '#111009',
                  color: form.category === cat ? '#c9952a' : '#7a6a50',
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: "'Share Tech Mono', monospace", fontSize: '0.7rem',
                }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{CATEGORY_ICONS[cat]}</div>
                <div>{categoryLabels[cat]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Location / Remote */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <label className="label" style={{ margin: 0 }}>{t('label_format')}</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#c0a880', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={form.is_remote}
                onChange={(e) => setForm({ ...form, is_remote: e.target.checked })}
                style={{ accentColor: '#c9952a' }}
              />
              {t('label_remote')}
            </label>
          </div>
          {!form.is_remote && (
            <input
              type="text"
              value={form.location_name}
              onChange={(e) => setForm({ ...form, location_name: e.target.value })}
              placeholder={t('label_location_ph')}
              className="input-field"
            />
          )}
        </div>

        {/* Budget */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <label className="label">{t('budget')}</label>
            <input
              type="number" min={0} step="0.01"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="0"
              className="input-field"
            />
          </div>
          <div style={{ width: '110px' }}>
            <label className="label">{t('label_currency')}</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="input-field"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="label">{t('label_deadline')}</label>
          <input
            type="datetime-local"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            min={new Date().toISOString().slice(0, 16)}
            className="input-field"
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(139,26,26,0.2)', border: '1px solid #8b1a1a', color: '#cc4444', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '1rem', fontSize: '1rem', opacity: loading ? 0.5 : 1 }}
        >
          {loading ? t('publishing') : t('publishTask')}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#7a5c1a', fontFamily: "'Share Tech Mono', monospace" }}>
          {t('agree_text')}
        </p>
      </form>
    </div>
  );
}
