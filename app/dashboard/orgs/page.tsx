'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getActiveOrgIdClient } from '@/lib/getActiveOrgIdClient';

type OrgRow = { id: string; name: string };

export default function OrgsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [orgId, setOrgId] = useState('');
  const [rows, setRows] = useState<OrgRow[]>([]);

  useEffect(() => { (async () => {
    const { orgId } = await getActiveOrgIdClient(); setOrgId(orgId);
  })(); }, []);

  useEffect(() => {
    (async () => {
      // orgs user belongs to
      const { data } = await supabase
        .from('org_members')
        .select('orgs:org_id(id,name)')
        .order('created_at', { ascending: true });

      const list = (data || []).map((r: any) => r.orgs).filter(Boolean);
      setRows(list);
    })();
  }, []);

  return (
    <main className="p-4 max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Organizations</h2>
      <ul className="space-y-2">
        {rows.map(o => (
          <li key={o.id} className="flex items-center justify-between rounded-md border p-2">
            <div className="font-medium">{o.name}</div>
            {o.id === orgId ? (
              <span className="text-xs rounded-full bg-green-100 text-green-800 px-2 py-0.5">Active</span>
            ) : (
              <form action="/api/switch-org" method="post">
                <input type="hidden" name="org_id" value={o.id} />
                <button className="text-sm rounded-md border px-3 py-1 hover:bg-gray-50">Switch</button>
              </form>
            )}
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-gray-500">You’re not in any orgs yet.</li>}
      </ul>
    </main>
  );
}