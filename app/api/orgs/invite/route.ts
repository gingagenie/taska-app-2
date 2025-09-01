import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

// App Router API route must export a function named for the HTTP verb.
export async function POST(req: Request) {
  try {
    const { orgId, email, role = 'member' } = await req.json();

    if (!orgId || !email) {
      return NextResponse.json(
        { error: 'orgId and email are required' },
        { status: 400 }
      );
    }

    // 1) Record the invite in your table (optional but useful for tracking)
    const { error: dbErr } = await supabaseAdmin
      .from('org_invites')
      .insert({ org_id: orgId, email, role });

    if (dbErr) {
      // If row exists already, you can ignore unique violations; otherwise bubble up
      if (!/duplicate key/i.test(dbErr.message)) {
        return NextResponse.json({ error: dbErr.message }, { status: 400 });
      }
    }

    // 2) Send an auth invite email via Supabase (service role key required)
    const site =
      (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
        /\/$/,
        ''
      );

    const { error: inviteErr } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${site}/invite/[token]?org=${orgId}&role=${role}`,
      });

    if (inviteErr) {
      return NextResponse.json({ error: inviteErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
