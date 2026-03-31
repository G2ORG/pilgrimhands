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

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.8rem', color: '#c9952a', marginBottom: '0.5rem' }}>
          Post a Task
        </h1>
        <p style={{ color: '#7a6a50', fontStyle: 'italic' }}>
          Describe what needs to be done and knights of the Order will respond with offers.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Title */}
        <div>
          <label className="label">Task Title *</label>
          <input
            type="text" required minLength={5}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Meet pilgrims at Tbilisi airport"
            className="input-field"
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Task details: what exactly needs to be done, special requirements..."
            className="input-field"
            style={{ resize: 'none' }}
          />
        </div>

        {/* Category */}
        <div>
          <label className="label">Category *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }} className="sm:grid-cols-4">
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
                <div>{CATEGORY_LABELS[cat]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Location / Remote */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <label className="label" style={{ margin: 0 }}>Format</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#c0a880', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={form.is_remote}
                onChange={(e) => setForm({ ...form, is_remote: e.target.checked })}
                style={{ accentColor: '#c9952a' }}
              />
              Remote (no location required)
            </label>
          </div>
          {!form.is_remote && (
            <input
              type="text"
              value={form.location_name}
              onChange={(e) => setForm({ ...form, location_name: e.target.value })}
              placeholder="City / address, e.g. Batumi, Georgia"
              className="input-field"
            />
          )}
        </div>

        {/* Budget */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <label className="label">Budget</label>
            <input
              type="number" min={0} step="0.01"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="0"
              className="input-field"
            />
          </div>
          <div style={{ width: '110px' }}>
            <label className="label">Currency</label>
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
          <label className="label">Deadline</label>
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
          {loading ? "Publishing..." : "Publish Task →"}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#7a5c1a', fontFamily: "'Share Tech Mono', monospace" }}>
          By posting a task you agree to the terms of use. Payment is held in escrow until completion.
        </p>
      </form>
    </div>
  );
}
