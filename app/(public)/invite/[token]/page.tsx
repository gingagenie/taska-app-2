'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function AcceptInvitePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [msg, setMsg] = useState<string>('Preparing your invite…');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) return;

      // Are we logged in?
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // Not logged in → stash token, send to login, bounce back to dashboard after
        sessionStorage.setItem('taska_invite_token', String(token));
        router.replace('/login?next=/dashboard');
        return;
      }

      // Logged in → accept immediately
      const { error } = await supabase.rpc('accept_org_invite', { p_token: token as any });
      if (error) {
        setErr(error.message);
        setMsg('');
        return;
      }

      setMsg('Invite accepted. Redirecting…');
      setTimeout(() => router.replace('/dashboard'), 600);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Join organisation</h1>
      {msg && <p className="text-sm text-gray-700">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </main>
  );
}