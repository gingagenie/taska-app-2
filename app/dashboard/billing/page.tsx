'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

export default function BillingPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [orgId, setOrgId] = useState<string>('');
  const [status, setStatus] = useState<string>('loading');
  const [loading, setLoading] = useState(false);

  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '') ||
               (typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '');

  const PRICE_SOLO = process.env.NEXT_PUBLIC_PRICE_SOLO!;
  const PRICE_PRO  = process.env.NEXT_PUBLIC_PRICE_PRO!;
  const PRICE_ENT  = process.env.NEXT_PUBLIC_PRICE_ENT!;

  const load = async () => {
    const { data: prof } = await supabase.from('profiles').select('active_org_id').single();
    if (!prof?.active_org_id) { setStatus('noorg'); return; }
    setOrgId(prof.active_org_id);

    const { data } = await supabase.from('orgs')
      .select('subscription_status')
      .eq('id', prof.active_org_id)
      .single();

    setStatus(data?.subscription_status || 'trialing');
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const checkout = async (priceId: string) => {
    if (!orgId) return alert('No active org.');
    setLoading(true);
    try {
      const resp = await fetch(`${site}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ priceId, orgId, mode: 'subscription' })
      });
      const { url, error } = await resp.json();
      if (error) alert(error);
      else if (url) window.location.href = url;
    } finally { setLoading(false); }
  };

  const openPortal = async () => {
    if (!orgId) return alert('No active org.');
    setLoading(true);
    try {
      const resp = await fetch(`${site}/api/stripe/portal`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ orgId })
      });
      const { url, error } = await resp.json();
      if (error) alert(error);
      else if (url) window.location.href = url;
    } finally { setLoading(false); }
  };

  return (
    <main>
      <h2>Billing</h2>
      <p><a href="/dashboard">← Back to Dashboard</a></p>

      {status === 'loading' && <p>Loading…</p>}
      {status === 'noorg' && <p>Create or switch to an org first.</p>}

      {status !== 'loading' && status !== 'noorg' && (
        <>
          <p>Current status: <strong>{status}</strong></p>

          <div style={{ display:'grid', gap:12, maxWidth:420 }}>
            <button disabled={loading} onClick={() => checkout(PRICE_SOLO)}>
              Subscribe to Taska Solo ($29)
            </button>
            <button disabled={loading} onClick={() => checkout(PRICE_PRO)}>
              Subscribe to Taska Pro ($49)
            </button>
            <button disabled={loading} onClick={() => checkout(PRICE_ENT)}>
              Subscribe to Taska Enterprise ($99)
            </button>
            <hr />
            <button disabled={loading} onClick={openPortal}>
              Manage subscription (Stripe Portal)
            </button>
          </div>
        </>
      )}
    </main>
  );
}
