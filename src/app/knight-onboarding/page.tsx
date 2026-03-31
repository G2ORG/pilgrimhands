"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SKILLS = [
  "Pilgrimage", "Translation", "Driving", "Photography", "Videography",
  "Legal Matters", "Medical Escort", "IT/Tech Support",
  "Research", "Notary", "Event Planning", "Tourism",
];

const LANGUAGES = [
  "English", "Russian", "Georgian (ქართული)", "German",
  "French", "Italian", "Spanish", "Arabic", "Chinese",
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

    const { error: knightError } = await supabase.from("knights").upsert({
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

    await supabase.from("profiles").update({
      role: "knight",
      bio: form.bio || null,
    }).eq("id", user.id);

    router.push("/dashboard?onboarded=1");
  };

  const tagStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.4rem 0.85rem',
    border: `1px solid ${active ? '#c9952a' : '#3a2f1a'}`,
    background: active ? 'rgba(201,149,42,0.15)' : 'transparent',
    color: active ? '#c9952a' : '#7a6a50',
    cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: "'Share Tech Mono', monospace", fontSize: '0.75rem',
  });

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚔️</div>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.6rem', color: '#c9952a', marginBottom: '0.5rem' }}>
          Become a Knight
        </h1>
        <p style={{ color: '#7a6a50', fontStyle: 'italic' }}>
          Fill in your profile and help pilgrims worldwide.
          Our moderators will review your application within 48 hours.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Cinzel', serif", fontSize: '0.8rem', fontWeight: 700,
              background: step >= s ? 'rgba(201,149,42,0.2)' : 'transparent',
              border: `1px solid ${step >= s ? '#c9952a' : '#3a2f1a'}`,
              color: step >= s ? '#c9952a' : '#7a5c1a',
            }}>
              {s}
            </div>
            {s < 3 && <div style={{ width: '48px', height: '1px', background: step > s ? '#c9952a' : '#3a2f1a' }} />}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '1.1rem' }}>About Yourself</h2>
            <div>
              <label className="label">Tell us about yourself *</label>
              <textarea
                rows={4} required
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Who you are, where you are located, your experience with the Order and helping pilgrims..."
                className="input-field"
                style={{ resize: 'none' }}
              />
            </div>
            <div>
              <label className="label">Your city / region *</label>
              <input
                type="text" required
                value={form.location_name}
                onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                placeholder="Batumi, Georgia"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Work radius: {form.radius_km} km</label>
              <input
                type="range" min={5} max={500} step={5}
                value={form.radius_km}
                onChange={(e) => setForm({ ...form, radius_km: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#c9952a' }}
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.bio || !form.location_name}
              className="btn-primary"
              style={{ width: '100%', opacity: (!form.bio || !form.location_name) ? 0.5 : 1 }}
            >
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '1.1rem' }}>Skills & Languages</h2>
            <div>
              <label className="label">What can you do? (select all that apply)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SKILLS.map((skill) => (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)} style={tagStyle(form.skills.includes(skill))}>
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Languages</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {LANGUAGES.map((lang) => (
                  <button key={lang} type="button" onClick={() => toggleLang(lang)} style={tagStyle(form.languages.includes(lang))}>
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>← Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={form.skills.length === 0}
                className="btn-primary"
                style={{ flex: 1, opacity: form.skills.length === 0 ? 0.5 : 1 }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', fontSize: '1.1rem' }}>Confirmation</h2>
            <div style={{ background: '#060402', border: '1px solid #3a2f1a', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: "City", value: form.location_name },
                { label: "Radius", value: `${form.radius_km} km` },
                { label: "Skills", value: form.skills.join(", ") || "—" },
                { label: "Languages", value: form.languages.join(", ") || "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#7a5c1a', fontFamily: "'Share Tech Mono', monospace", minWidth: '80px' }}>{label}:</span>
                  <span style={{ color: '#c0a880' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(201,149,42,0.08)', border: '1px solid #7a5c1a', padding: '1rem', fontSize: '0.85rem', color: '#d4b896', fontStyle: 'italic' }}>
              <strong style={{ fontStyle: 'normal', color: '#c9952a' }}>Important:</strong> Your application will be reviewed by Order moderators
              within 48 hours. You will receive an email notification after approval.
            </div>

            {error && (
              <p style={{ color: '#cc4444', fontSize: '0.85rem', background: 'rgba(139,26,26,0.2)', padding: '0.5rem 0.75rem', border: '1px solid #8b1a1a' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1 }}>← Back</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
                style={{ flex: 1, opacity: loading ? 0.5 : 1 }}
              >
                {loading ? "Submitting..." : "Submit Application ⚔️"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
