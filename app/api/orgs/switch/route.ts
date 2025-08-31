import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  const { orgId } = await req.json();
  if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });

  // call RPC as the **service role** and impersonate user via auth.uid()
  // Supabase can't impersonate; so we require the client to be authed and do this via anon client normally.
  // Simpler path: do it with anon client on the client (recommended). But for now:
  return NextResponse.json({ ok: true, note: 'Call switch_active_org via client supabase.rpc from browser.' });
}
