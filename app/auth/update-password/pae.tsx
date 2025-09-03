'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function UpdatePasswordPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const REDIRECT_TO = `${SITE_URL}/dashboard`;

  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // When user arrives from the email, Supabase sets a "recovery" session.
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setErr('Recovery link is invalid or expired. Try sending a new reset email.');
      }
    })();
  }, []);

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null);

    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) return setErr(error.message);

    setMsg('Password updated. Redirecting…');
    setTimeout(() => (window.location.href = REDIRECT_TO), 800);
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Set a new password</h1>
      <form onSubmit={onUpdate} className="space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-800">New password</label>
          <input className="w-full rounded-lg border px-3 py-2" type="password"
                 value={pwd} onChange={e=>setPwd(e.target.value)} required />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-green-700">{msg}</p>}
        <button type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Update password
        </button>
      </form>
    </main>
  );
}