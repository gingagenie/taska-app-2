'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function RegisterPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const REDIRECT_AFTER_VERIFY = `${SITE_URL}/dashboard`; // where to go after clicking email verify

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);

    const { error, data } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: REDIRECT_AFTER_VERIFY }
    });

    setLoading(false);
    if (error) return setErr(error.message);

    // If email confirmation is ON, user must click verify link
    setMsg('Check your inbox to confirm your email.');
    if (!data?.user?.identities?.length) {
      // If email confirmation is OFF, you may already be signed in. Redirect:
      window.location.href = REDIRECT_AFTER_VERIFY;
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      <form onSubmit={onRegister} className="space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-800">Email</label>
          <input className="w-full rounded-lg border px-3 py-2" type="email"
                 value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800">Password</label>
          <input className="w-full rounded-lg border px-3 py-2" type="password"
                 value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-green-700">{msg}</p>}
        <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Creating…' : 'Create account'}
        </button>
        <div className="text-sm text-center">
          <Link href="/login" className="underline">Back to login</Link>
        </div>
      </form>
    </main>
  );
}