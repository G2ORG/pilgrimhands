export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { T } from "@/components/T";

export default async function KnightsPage() {
  const supabase = await createClient();

  const { data: knightsData } = await supabase
    .from("knights")
    .select(`
      id, skills, languages, location_name, rating, completed_count,
      profile:profiles!inner(id, display_name, avatar_url, bio)
    `)
    .eq("verification_status", "verified")
    .order("rating", { ascending: false })
    .limit(50);

  const knights: any[] = knightsData ?? [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.8rem', color: '#c9952a', marginBottom: '0.25rem' }}>
            <T k="knightsTitle" f="Knights of the Order" />
          </h1>
          <p style={{ color: '#7a6a50', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.85rem' }}>
            {knights.length} <T k="knightsVerified" f="verified performers" />
          </p>
        </div>
        <Link href="/knight-onboarding" className="btn-secondary">
          <T k="becomeKnight" f="⚔️ Become a Knight" />
        </Link>
      </div>

      {knights.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚔️</div>
          <h3 style={{ fontFamily: "'Cinzel', serif", color: '#c9952a', marginBottom: '0.5rem' }}><T k="noKnights" f="No knights yet" /></h3>
          <p style={{ color: '#7a6a50', fontStyle: 'italic' }}><T k="noKnightsBe" f="Be the first knight of the Order!" /></p>
          <Link href="/knight-onboarding" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
            <T k="apply" f="Apply Now" />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }} className="md:grid-cols-2 lg:grid-cols-3">
          {knights.map((knight: any) => (
            <div key={knight.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px', height: '48px', flexShrink: 0,
                  background: 'rgba(201,149,42,0.15)', border: '1px solid #7a5c1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Cinzel Decorative', serif", color: '#c9952a', fontSize: '1.2rem', fontWeight: 700,
                }}>
                  {knight.profile?.display_name?.[0] ?? "?"}
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Cinzel', serif", color: '#c0a880', fontSize: '0.95rem' }}>
                    {knight.profile?.display_name}
                  </h3>
                  {knight.location_name && (
                    <p style={{ color: '#7a6a50', fontSize: '0.8rem' }}>📍 {knight.location_name}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ color: '#c9952a', fontSize: '0.8rem' }}>
                      {"★".repeat(Math.round(knight.rating))}{"☆".repeat(5 - Math.round(knight.rating))}
                    </span>
                    <span style={{ color: '#7a5c1a', fontSize: '0.75rem', fontFamily: "'Share Tech Mono', monospace" }}>
                      {knight.completed_count} tasks
                    </span>
                  </div>
                </div>
              </div>

              {knight.profile?.bio && (
                <p style={{ color: '#7a6a50', fontSize: '0.85rem', marginBottom: '1rem', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                  {knight.profile.bio}
                </p>
              )}

              {knight.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  {knight.skills.slice(0, 4).map((skill: string) => (
                    <span key={skill} className="badge" style={{ background: 'rgba(201,149,42,0.08)', color: '#7a6a50', border: '1px solid #3a2f1a', padding: '2px 8px', fontSize: '0.7rem' }}>
                      {skill}
                    </span>
                  ))}
                  {knight.skills.length > 4 && (
                    <span className="badge" style={{ background: 'rgba(201,149,42,0.08)', color: '#7a5c1a', border: '1px solid #3a2f1a', padding: '2px 8px', fontSize: '0.7rem' }}>
                      +{knight.skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              {knight.languages?.length > 0 && (
                <p style={{ fontSize: '0.75rem', color: '#7a5c1a', fontFamily: "'Share Tech Mono', monospace" }}>
                  🌐 {knight.languages.join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
