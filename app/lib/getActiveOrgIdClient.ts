'use client';
import { createBrowserClient } from '@supabase/ssr';

/** Safely get the current user's active org id (or '') without throwing. */
export async function getActiveOrgIdClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id || '';
  if (!uid) return { orgId: '', profile: null };

  // IMPORTANT: maybeSingle() so it never throws if no profile row yet
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, active_org_id')
    .eq('id', uid)
    .maybeSingle();

  return { orgId: profile?.active_org_id ?? '', profile: profile ?? null };
}