// app/api/ensure-org/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    }
  );

  // 1) must be authed
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ ok: false, step: "getUser", error: userErr?.message || "No session" }, { status: 401 });
  }

  // 2) ensure profile exists (if you don’t have a trigger)
  const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!prof) {
    const { error: insProfErr } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
    });
    if (insProfErr) {
      return NextResponse.json({ ok: false, step: "insertProfile", error: insProfErr.message }, { status: 400 });
    }
  }

  // 3) if already has an active org, we’re done
  const { data: prof2, error: profErr2 } = await supabase.from("profiles").select("active_org_id").eq("id", user.id).single();
  if (profErr2) {
    return NextResponse.json({ ok: false, step: "loadProfile2", error: profErr2.message }, { status: 400 });
  }
  if (prof2?.active_org_id) {
    return NextResponse.json({ ok: true, org_id: prof2.active_org_id, msg: "already-active" });
  }

  // 4) get a friendly org name if the client posted one
  let posted: { name?: string } = {};
  try { posted = await req.json(); } catch {}
  const orgName = posted.name?.trim() || (user.user_metadata?.full_name || user.email || "My Organization");

  // 5) create org
  const { data: org, error: orgErr } = await supabase
    .from("orgs")
    .insert({ name: orgName })
    .select("id")
    .single();

  if (orgErr) {
    return NextResponse.json({ ok: false, step: "insertOrg", error: orgErr.message }, { status: 400 });
  }

  // 6) add membership (owner)
  const { error: memErr } = await supabase.from("org_members").insert({
    org_id: org.id,
    user_id: user.id,
    role: "owner",
  });
  if (memErr) {
    return NextResponse.json({ ok: false, step: "insertMembership", error: memErr.message }, { status: 400 });
  }

  // 7) set active_org_id
  const { error: updErr } = await supabase.from("profiles").update({ active_org_id: org.id }).eq("id", user.id);
  if (updErr) {
    return NextResponse.json({ ok: false, step: "updateProfile", error: updErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, org_id: org.id });
}
