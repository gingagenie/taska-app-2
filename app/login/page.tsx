'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const REDIRECT_TO = `${SITE_URL}/dashboard`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    window.location.href = REDIRECT_TO;
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Log in</h1>
      <form onSubmit={onLogin} className="space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
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
        <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="flex justify-between text-sm">
          <Link href="/register" className="underline">Create account</Link>
          <Link href="/reset-password" className="underline">Forgot password?</Link>
        </div>
      </form>
    </main>
  );
}