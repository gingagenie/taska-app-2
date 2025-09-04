'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type OrgRow = { id: string; name: string };

export default function OrgsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [rows, setRows] = useState<OrgRow[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // profile
      const { data: prof } = await supabase.from('profiles').select('active_org_id').single();
      setActiveOrgId((prof?.active_org_id as string) || null);

      // orgs you belong to
      const { data } = await supabase
        .from('orgs')
        .select('id,name')
        .order('name', { ascending: true });
      setRows((data as any) || []);
    })();
  }, [supabase]);

  return (
    <main className="p-4">
      <h2 className="text-xl font-semibold mb-4">Organizations</h2>

      <div className="mb-4 flex gap-2">
        <button
          className="rounded-md border px-3 py-2 hover:bg-gray-50"
          onClick={async () => {
            await fetch('/api/ensure-org', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
            const { data: prof } = await supabase.from('profiles').select('active_org_id').single();
            setActiveOrgId((prof?.active_org_id as string) || null);
            const { data } = await supabase.from('orgs').select('id,name').order('name', { ascending: true });
            setRows((data as any) || []);
          }}
        >
          Create / Fix my org
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-600">You’re not in any orgs yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((o) => (
            <li key={o.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{o.name}</div>
                {activeOrgId === o.id && <div className="text-xs text-green-600">Active</div>}
              </div>
              {activeOrgId !== o.id && (
                <button
                  className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                  onClick={async () => {
                    await supabase.from('profiles').update({ active_org_id: o.id }).select().single();
                    setActiveOrgId(o.id);
                  }}
                >
                  Set Active
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
