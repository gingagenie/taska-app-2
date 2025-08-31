'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

export default function AcceptInvite({ params }: any) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const token = params.token as string;
  const [status, setStatus] = useState<'idle'|'ok'|'err'|'needsLogin'>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        setStatus('needsLogin');
        setMsg('Please log in first (use magic link), then click the invite again.');
        return;
      }
      const { data, error } = await supabase.rpc('accept_invite', { p_token: token });
      if (error) { setStatus('err'); setMsg(error.message); }
      else { setStatus('ok'); setMsg('Invite accepted. Org set active.'); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

  return (
    <main>
      <h1>Accept Invite</h1>
      {status === 'needsLogin' && (
        <p>{msg} <a href={`${SITE_URL}`}>Go to login</a></p>
      )}
      {status === 'ok' && (
        <p>{msg} <a href="/dashboard/orgs">Go to orgs</a></p>
      )}
      {status === 'err' && <p style={{color:'crimson'}}>Error: {msg}</p>}
      {status === 'idle' && <p>Processing…</p>}
    </main>
  );
}
