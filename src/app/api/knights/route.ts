import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();

  let query = supabase
    .from("knights")
    .select(`
      id,
      display_name:profiles!inner(display_name),
      skills, languages, location_name,
      rating, completed_count, verification_status
    `)
    .eq("verification_status", "verified")
    .order("rating", { ascending: false })
    .limit(50);

  const skill = searchParams.get("skill");
  const location = searchParams.get("location");
  const language = searchParams.get("language");

  if (skill) query = query.contains("skills", [skill]);
  if (language) query = query.contains("languages", [language]);
  if (location) query = query.ilike("location_name", `%${location}%`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ knights: data, count: data?.length ?? 0 });
}
