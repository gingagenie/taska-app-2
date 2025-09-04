// API: ensure the signed-in user has an org + membership and set active_org_id
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          // next/headers has no remove; emulate by setting empty
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

export async function POST(req: Request) {
  const supabase = supabaseServer();

  // must be authenticated (uses auth cookie coming from the browser)
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // optional org name from body
  let name = "My Organization";
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.name === "string" && body.name.trim()) {
      name = body.name.trim();
    }
  } catch {
    /* ignore */
  }

  // If user already belongs to any org, just ensure active_org_id is set
  const { data: existingMem } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingMem?.org_id) {
    // set active_org_id if null
    await supabase
      .from("profiles")
      .update({ active_org_id: existingMem.org_id })
      .eq("id", user.id)
      .is("active_org_id", null);

    return NextResponse.json({ ok: true, org_id: existingMem.org_id });
  }

  // Create org
  const { data: org, error: orgErr } = await supabase
    .from("orgs")
    .insert({ name })
    .select("id")
    .single();

  if (orgErr || !org) {
    return NextResponse.json(
      { error: orgErr?.message || "Failed to create org" },
      { status: 400 }
    );
  }

  // Make the user the owner
  const { error: memErr } = await supabase
    .from("org_members")
    .insert({ org_id: org.id, user_id: user.id, role: "owner" });

  if (memErr) {
    return NextResponse.json(
      { error: memErr.message || "Failed to create membership" },
      { status: 400 }
    );
  }

  // Set as active org on profile
  await supabase
    .from("profiles")
    .update({ active_org_id: org.id })
    .eq("id", user.id);

  return NextResponse.json({ ok: true, org_id: org.id });
}
