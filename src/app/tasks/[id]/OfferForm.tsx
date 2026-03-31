"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function OfferForm({
  taskId,
  currency,
}: {
  taskId: string;
  currency: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ price: "", message: "", eta_hours: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Please sign in first"); setLoading(false); return; }

    const { error: dbError } = await supabase.from("offers").insert({
      task_id: taskId,
      knight_id: user.id,
      price: parseFloat(form.price),
      message: form.message || null,
      eta_hours: form.eta_hours ? parseInt(form.eta_hours) : null,
      status: "pending",
    });

    if (dbError) { setError(dbError.message); setLoading(false); return; }

    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <label className="label">Price ({currency}) *</label>
          <input
            type="number" required min={0} step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="50"
            className="input-field"
          />
        </div>
        <div style={{ width: '120px' }}>
          <label className="label">ETA (hours)</label>
          <input
            type="number" min={1}
            value={form.eta_hours}
            onChange={(e) => setForm({ ...form, eta_hours: e.target.value })}
            placeholder="24"
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="label">Message to client</label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Briefly about yourself and how you will complete the task..."
          className="input-field"
          style={{ resize: 'none' }}
        />
      </div>
      {error && (
        <p style={{ color: '#cc4444', fontSize: '0.85rem', background: 'rgba(139,26,26,0.2)', padding: '0.5rem 0.75rem', border: '1px solid #8b1a1a' }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{ width: '100%', opacity: loading ? 0.5 : 1 }}
      >
        {loading ? "Submitting..." : "Submit Offer"}
      </button>
    </form>
  );
}
