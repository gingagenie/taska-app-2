'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function ResetRequestPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const RESET_REDIRECT = `${SITE_URL}/auth/update-password`; // must match Supabase settings

  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null); setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: RESET_REDIRECT,
    });

    setLoading(false);
    if (error) return setErr(error.message);
    setMsg('Check your inbox for a password reset link.');
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Reset password</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-800">Email</label>
          <input className="w-full rounded-lg border px-3 py-2" type="email"
                 value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-green-700">{msg}</p>}
        <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        <div className="text-sm text-center">
          <Link href="/login" className="underline">Back to login</Link>
        </div>
      </form>
    </main>
  );
}
