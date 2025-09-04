// app/api/ensure-org/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { name } = await req.json().catch(() => ({ name: null as string | null }));

  // who am I?
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  // load profile
  const { data: profile } = await supabase.from("profiles").select("id, active_org_id").eq("id", user.id).single();

  if (profile?.active_org_id) {
    return NextResponse.json({ ok: true, org_id: profile.active_org_id });
  }

  // create org
  const orgName = name?.trim() || "My Organization";
  const { data: org, error: orgErr } = await supabase
    .from("orgs")
    .insert({ name: orgName })
    .select("id")
    .single();

  if (orgErr) return NextResponse.json({ ok: false, error: orgErr.message }, { status: 400 });

  // member as owner
  const { error: memErr } = await supabase
    .from("org_members")
    .insert({ org_id: org.id, user_id: user.id, role: "owner" });

  if (memErr) return NextResponse.json({ ok: false, error: memErr.message }, { status: 400 });

  // set active_org_id
  const { error: profErr } = await supabase
    .from("profiles")
    .update({ active_org_id: org.id })
    .eq("id", user.id);

  if (profErr) return NextResponse.json({ ok: false, error: profErr.message }, { status: 400 });

  return NextResponse.json({ ok: true, org_id: org.id });
}
