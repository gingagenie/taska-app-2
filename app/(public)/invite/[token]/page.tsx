'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function AcceptInvitePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const params = useParams();
  const token = (params as { token?: string })?.token;  // ✅ safe access
  const router = useRouter();
  const [msg, setMsg] = useState<string>('Preparing your invite…');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) return;

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        sessionStorage.setItem('taska_invite_token', String(token));
        router.replace('/login?next=/dashboard');
        return;
      }

      const { error } = await supabase.rpc('accept_org_invite', { p_token: token as any });
      if (error) {
        setErr(error.message);
        setMsg('');
        return;
      }

      setMsg('Invite accepted. Redirecting…');
      setTimeout(() => router.replace('/dashboard'), 600);
    })();
  }, [token, supabase, router]);

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Join organisation</h1>
      {msg && <p className="text-sm text-gray-700">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </main>
  );
}
