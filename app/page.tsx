'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useMemo, useState } from 'react';

export default function Home() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Prefer explicit env (prod), otherwise fall back to current origin (vercel preview/local)
  const SITE_URL = useMemo(() => {
    const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    if (fromEnv) return fromEnv;
    if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '');
    return 'http://localhost:3000';
  }, []);

  const REDIRECT_TO = `${SITE_URL}/dashboard`;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (!email || !email.includes('@')) {
      setErr('Enter a valid email.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: REDIRECT_TO }, // 👈 force where the magic link lands
      });

      if (error) setErr(error.message);
      else setMsg('Magic link sent. Check your inbox (and spam).');
    } catch (e: any) {
      setErr(e?.message || 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Taska Minimal Starter</h1>
      <p>Login to continue.</p>

      <form onSubmit={signIn} style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send Magic Link'}
        </button>
      </form>

      {msg && <p style={{ color: 'green', marginTop: 8 }}>{msg}</p>}
      {err && <p style={{ color: 'crimson', marginTop: 8 }}>{err}</p>}

      <p style={{ marginTop: 16 }}>
        <a href="/dashboard">Go to dashboard</a>
      </p>

      <small style={{ color: '#666' }}>
        Redirect target:&nbsp;<code>{REDIRECT_TO}</code>
      </small>
    </main>
  );
}
