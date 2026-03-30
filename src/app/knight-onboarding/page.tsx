"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const SKILLS = [
  "Паломничество", "Переводы", "Вождение", "Фотография", "Видеосъёмка",
  "Юридические вопросы", "Мед. сопровождение", "IT/Технологии",
  "Исследования", "Нотариус", "Организация мероприятий", "Туризм",
];

const LANGUAGES = [
  "Русский", "English", "Georgian (ქართული)", "Deutsch",
  "Français", "Italiano", "Español", "Arabic", "Chinese",
];

export default function KnightOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    bio: "",
    skills: [] as string[],
    languages: [] as string[],
    location_name: "",
    radius_km: 50,
    telegram_username: "",
  });

  const toggleSkill = (skill: string) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const toggleLang = (lang: string) => {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter(l => l !== lang)
        : [...f.languages, lang],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth?redirectTo=/knight-onboarding");
      return;
    }

    // Upsert knight profile
    const { error: knightError } = await supabase
      .from("knights")
      .upsert({
        id: user.id,
        skills: form.skills,
        languages: form.languages,
        location_name: form.location_name || null,
        radius_km: form.radius_km,
        verification_status: "pending",
      });

    if (knightError) {
      setError(knightError.message);
      setLoading(false);
      return;
    }

    // Update profile role and bio
    await supabase.from("profiles").update({
      role: "knight",
      bio: form.bio || null,
    }).eq("id", user.id);

    router.push("/dashboard?onboarded=1");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">⚔️</div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">
          Стать рыцарем Ордена
        </h1>
        <p className="text-gray-500 mt-2">
          Заполните профиль и помогайте паломникам по всему миру.
          Наши модераторы проверят заявку в течение 48 часов.
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step >= s ? "bg-crimson-700 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-crimson-700" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-bold text-gray-900">О себе</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Расскажите о себе *
              </label>
              <textarea
                rows={4} required
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Кто вы, где находитесь, как давно связаны с Орденом, какой опыт помощи паломникам..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crimson-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ваш город / регион *
              </label>
              <input
                type="text" required
                value={form.location_name}
                onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                placeholder="Батуми, Грузия"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crimson-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Радиус работы: {form.radius_km} км
              </label>
              <input
                type="range" min={5} max={500} step={5}
                value={form.radius_km}
                onChange={(e) => setForm({ ...form, radius_km: parseInt(e.target.value) })}
                className="w-full accent-crimson-600"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.bio || !form.location_name}
              className="w-full btn-primary disabled:opacity-50"
            >
              Далее →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-bold text-gray-900">Навыки и языки</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Что умеете? (выберите все подходящие)
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      form.skills.includes(skill)
                        ? "bg-crimson-700 text-white border-crimson-700"
                        : "bg-white text-gray-600 border-gray-200 hover:border-crimson-300"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Языки
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLang(lang)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      form.languages.includes(lang)
                        ? "bg-crimson-700 text-white border-crimson-700"
                        : "bg-white text-gray-600 border-gray-200 hover:border-crimson-300"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Назад</button>
              <button
                onClick={() => setStep(3)}
                disabled={form.skills.length === 0}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Далее →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-bold text-gray-900">Подтверждение</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div><span className="text-gray-500">Город:</span> <span className="font-medium">{form.location_name}</span></div>
              <div><span className="text-gray-500">Радиус:</span> <span className="font-medium">{form.radius_km} км</span></div>
              <div><span className="text-gray-500">Навыки:</span> <span className="font-medium">{form.skills.join(", ") || "—"}</span></div>
              <div><span className="text-gray-500">Языки:</span> <span className="font-medium">{form.languages.join(", ") || "—"}</span></div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <strong>Важно:</strong> Ваша заявка будет рассмотрена модераторами Ордена
              в течение 48 часов. Вы получите уведомление на email после одобрения.
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Назад</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? "Отправляем..." : "Подать заявку ⚔️"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
