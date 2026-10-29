import { NextResponse } from "next/server";
import { savedAnalysisSchema } from "@/lib/analysis/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Saved analyses require Supabase configuration." }, { status: 503 });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to view saved analyses." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("analyses")
    .select("id, title, created_at, report")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    return NextResponse.json({ error: "Saved analyses are temporarily unavailable." }, { status: 503 });
  }
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Saving reports requires Supabase configuration." }, { status: 503 });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to save this report." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid report." }, { status: 400 });
  }
  const parsed = savedAnalysisSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "The report could not be validated." }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      report: parsed.data.report,
    })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json({ error: "The report could not be saved." }, { status: 503 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Saved analyses require Supabase configuration." }, { status: 503 });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to delete saved analyses." }, { status: 401 });
  }
  const { count, error } = await supabase
    .from("analyses")
    .delete({ count: "exact" })
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: "Saved analyses could not be deleted." }, { status: 503 });
  }
  return NextResponse.json({ deleted: count ?? 0 });
}
