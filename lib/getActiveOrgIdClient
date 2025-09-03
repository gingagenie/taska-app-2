'use client';
import { createBrowserClient } from '@supabase/ssr';

export async function getActiveOrgIdClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id || '';
  if (!uid) return { orgId: '', profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, active_org_id')
    .eq('id', uid)
    .maybeSingle();

  return { orgId: profile?.active_org_id ?? '', profile: profile ?? null };
}
