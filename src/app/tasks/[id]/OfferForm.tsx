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
    if (!user) { setError("Войдите в систему"); setLoading(false); return; }

    const { error: dbError } = await supabase.from("offers").insert({
      task_id: taskId,
      knight_id: user.id,
      price: parseFloat(form.price),
      message: form.message || null,
      eta_hours: form.eta_hours ? parseInt(form.eta_hours) : null,
      status: "pending",
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Цена ({currency}) *</label>
          <input
            type="number" required min={0} step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="50"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crimson-500"
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">Срок (часов)</label>
          <input
            type="number" min={1}
            value={form.eta_hours}
            onChange={(e) => setForm({ ...form, eta_hours: e.target.value })}
            placeholder="24"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crimson-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Сообщение заказчику</label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Кратко о себе и как вы выполните задачу..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crimson-500 resize-none"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? "Отправляем..." : "Подать предложение"}
      </button>
    </form>
  );
}
