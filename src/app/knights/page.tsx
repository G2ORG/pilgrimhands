import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function KnightsPage() {
  const supabase = await createClient();

  const { data: knights = [] } = await supabase
    .from("knights")
    .select(`
      id, skills, languages, location_name, rating, completed_count,
      profile:profiles!inner(id, display_name, avatar_url, bio)
    `)
    .eq("verification_status", "verified")
    .order("rating", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Рыцари Ордена</h1>
          <p className="text-gray-500 mt-1">
            {knights.length} проверенных исполнителей
          </p>
        </div>
        <Link href="/knight-onboarding" className="btn-secondary">
          ⚔️ Стать рыцарем
        </Link>
      </div>

      {knights.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⚔️</div>
          <h3 className="font-serif text-xl text-gray-700 mb-2">Рыцари ещё не присоединились</h3>
          <p className="text-gray-500">Станьте первым рыцарем Ордена!</p>
          <Link href="/knight-onboarding" className="btn-primary inline-block mt-6">
            Подать заявку
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knights.map((knight: any) => (
            <div key={knight.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-crimson-100 flex items-center justify-center text-crimson-700 font-bold text-lg shrink-0">
                  {knight.profile?.display_name?.[0] ?? "?"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{knight.profile?.display_name}</h3>
                  {knight.location_name && (
                    <p className="text-gray-500 text-sm">📍 {knight.location_name}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-500 text-sm">
                      {"★".repeat(Math.round(knight.rating))}{"☆".repeat(5 - Math.round(knight.rating))}
                    </span>
                    <span className="text-gray-400 text-xs">{knight.completed_count} задач</span>
                  </div>
                </div>
              </div>

              {knight.profile?.bio && (
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{knight.profile.bio}</p>
              )}

              {knight.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {knight.skills.slice(0, 4).map((skill: string) => (
                    <span key={skill} className="badge bg-gray-100 text-gray-600 text-xs px-2 py-0.5">
                      {skill}
                    </span>
                  ))}
                  {knight.skills.length > 4 && (
                    <span className="badge bg-gray-100 text-gray-500 text-xs px-2 py-0.5">
                      +{knight.skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              {knight.languages?.length > 0 && (
                <p className="text-xs text-gray-400">
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
