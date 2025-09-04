'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const params = useSearchParams(); // may be null per TS, so guard when reading

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, bounce to dashboard (or ?next=)
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const next = params?.get('next') ?? '/dashboard';
        window.location.replace(next);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    // If we came from an invite, accept it now (token stored by /invite/[token])
    const token = sessionStorage.getItem('taska_invite_token');
    if (token) {
      const { error: joinErr } = await supabase.rpc('accept_org_invite', { p_token: token });
      sessionStorage.removeItem('taska_invite_token');
      if (joinErr) {
        // Non-fatal — user is logged in, just report and continue
        console.error(joinErr);
      }
    }

    const next = params?.get('next') ?? '/dashboard';
    window.location.replace(next);
  }

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Log in</h1>

      <form onSubmit={handleLogin} className="space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-800">Email</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800">Password</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
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
