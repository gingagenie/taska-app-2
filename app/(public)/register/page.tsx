'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function Register() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null);
    setLoading(true);

    // 1) Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }, // saved to auth metadata
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is ON, there won't be a session yet:
    if (!data.session) {
      setMsg('Check your email to confirm your account. Then log in.');
      setLoading(false);
      return;
    }

    // 2) Already signed in (confirmation off) → bootstrap org immediately
    const { error: rpcError } = await supabase.rpc('bootstrap_org', {
      p_org_name: orgName,
      p_full_name: fullName || null,
    });
    if (rpcError) {
      setErr(rpcError.message);
    } else {
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="t-h1 mb-6">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="t-label">Full name</label>
          <input className="t-input" value={fullName} onChange={e=>setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="t-label">Organisation</label>
          <input className="t-input" value={orgName} onChange={e=>setOrgName(e.target.value)} required />
        </div>
        <div>
          <label className="t-label">Email</label>
          <input type="email" className="t-input" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="t-label">Password</label>
          <input type="password" className="t-input" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>

        <button className="t-btn t-btn--primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>

      {msg && <p className="mt-4 text-green-600">{msg}</p>}
      {err && <p className="mt-4 text-red-600">{err}</p>}

      <p className="mt-6 text-sm">
        Already have an account? <Link className="text-blue-600 underline" href="/login">Log in</Link>
      </p>
    </main>
  );
}