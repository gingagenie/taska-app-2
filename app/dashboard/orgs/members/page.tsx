'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

type Row = { user_id: string; role: string; email: string };

export default function MembersPage({ searchParams }: any) {
  const orgId = (searchParams?.org as string) || '';
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.rpc('members_with_email', { p_org: orgId });
    if (!error) setRows(data || []);
  };

  useEffect(() => { load(); }, [orgId]);

  const invite = async () => {
    setMsg(null);
    const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const resp = await fetch(`${site}/api/orgs/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, email, role })
    });
    const data = await resp.json();
    if (data.error) alert(data.error);
    else setMsg('Invite sent (check recipient inbox).');
  };

  return (
    <main>
      <h2>Members</h2>
      {!orgId && <p>No org selected.</p>}

      {orgId && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
            <button onClick={invite}>Invite</button>
          </div>
          {msg && <p style={{ color: 'green' }}>{msg}</p>}

          <ul style={{ paddingLeft: 16 }}>
            {rows.map(r => (
              <li key={r.user_id}>{r.email} — {r.role}</li>
            ))}
            {rows.length === 0 && <li>No members found.</li>}
          </ul>
        </>
      )}
    </main>
  );
}
