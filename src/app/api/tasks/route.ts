import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const createTaskSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().optional(),
  category: z.enum(["pilgrimage", "delivery", "photography", "documents", "tech", "research", "representation", "other"]),
  location_name: z.string().optional(),
  is_remote: z.boolean().default(false),
  budget: z.number().positive().optional(),
  currency: z.string().default("USD"),
  deadline: z.string().optional(),
});

async function getApiUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const apiKey = authHeader.slice(7);

  // Hash the key and look up
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: apiKeyRecord } = await serviceClient
    .from("api_keys")
    .select("user_id")
    .eq("key_hash", keyHash)
    .single();

  if (!apiKeyRecord) return null;

  // Update last_used_at
  await serviceClient
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", keyHash);

  return apiKeyRecord.user_id as string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select("id, title, description, category, location_name, is_remote, budget, currency, status, deadline, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50);

  const category = searchParams.get("category");
  const location = searchParams.get("location");
  const remote = searchParams.get("remote");

  if (category) query = query.eq("category", category);
  if (location) query = query.ilike("location_name", `%${location}%`);
  if (remote === "true") query = query.eq("is_remote", true);

  // Check API key visibility
  const apiUserId = await getApiUser(request);
  if (!apiUserId) {
    query = query.eq("visibility", "public");
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data, count: data?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  let userId: string | null = null;

  // Try API key auth first
  const apiUserId = await getApiUser(request);
  if (apiUserId) {
    userId = apiUserId;
  } else {
    // Try session auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 422 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...parsed.data,
      client_id: userId,
      status: "open",
      visibility: "public",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data }, { status: 201 });
}
