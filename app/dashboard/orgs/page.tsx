'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

type Org = { id: string; name: string };

export default function OrgsPage() {   // ✅ default export of a React component
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrg, setActiveOrg] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    const { data: profile, error: pErr } = await supabase.from('profiles').select('active_org_id').single();
    if (pErr) setErr(pErr.message);
    setActiveOrg(profile?.active_org_id || '');

    const { data, error } = await supabase.from('orgs').select('id, name').order('created_at', { ascending: true });
    if (error) setErr(error.message);
    setOrgs(data || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const createOrg = async () => {
    const name = prompt('Org name?') || 'My Org';
    const { error } = await supabase.rpc('create_org_and_join', { p_name: name });
    if (error) alert(error.message);
    await load();
  };

  const switchOrg = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.rpc('switch_active_org', { p_org: id });
    if (error) alert(error.message);
    await load();
    setLoading(false);
  };

  return (
    <main>
      <h2>Organisations</h2>
      <p><a href="/dashboard">← Back to Dashboard</a></p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={createOrg}>Create Org</button>
        <a href="/dashboard/orgs/settings"><button>Org Settings</button></a>
      </div>

      {err && <p style={{ color: 'crimson' }}>Error: {err}</p>}

      <ul style={{ paddingLeft: 16 }}>
        {orgs.map((o) => (
          <li key={o.id} style={{ marginBottom: 8 }}>
            <strong>{o.name}</strong>{' '}
            {activeOrg === o.id ? (
              <em>(active)</em>
            ) : (
              <button disabled={loading} onClick={() => switchOrg(o.id)}>
                {loading ? 'Switching…' : 'Set Active'}
              </button>
            )}
            {' '}
            <a href={`/dashboard/orgs/members?org=${o.id}`}>Members</a>
          </li>
        ))}
        {orgs.length === 0 && <li>No orgs yet.</li>}
      </ul>
    </main>
  );
}
