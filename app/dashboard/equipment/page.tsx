'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getActiveOrgIdClient } from '@/lib/getActiveOrgIdClient';

type EqRow = { id: string; make?: string|null; model?: string|null; serial_number?: string|null; customers?: { name?: string|null } };

export default function EquipmentList() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [orgId, setOrgId] = useState('');
  const [rows, setRows] = useState<EqRow[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => { (async () => {
    const { orgId } = await getActiveOrgIdClient(); setOrgId(orgId);
  })(); }, []);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      let req = supabase.from('equipment')
        .select('id,make,model,serial_number, customers:customer_id(name)')
        .eq('org_id', orgId)
        .order('make', { ascending: true })
        .limit(100);
      if (q) {
        req = req.or(`make.ilike.%${q}%,model.ilike.%${q}%,serial_number.ilike.%${q}%`);
      }
      const { data } = await req;
      setRows(data || []);
    })();
  }, [orgId, q]);

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Equipment</h2>
        <a className="rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700" href="/dashboard/equipment/new">+ Add Equipment</a>
      </div>

      <input className="w-full max-w-md rounded-md border px-3 py-2 mb-3" placeholder="Search make / model / serial…" value={q} onChange={e=>setQ(e.target.value)} />

      <ul className="space-y-2">
        {rows.map(r => (
          <li key={r.id} className="rounded-md border p-3">
            <div className="font-medium">{r.make ?? '—'} {r.model ?? ''}</div>
            <div className="text-xs text-gray-500">
              SN: {r.serial_number ?? '—'} • {r.customers?.name ?? 'Unassigned'}
            </div>
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-gray-500">No equipment yet.</li>}
      </ul>
    </main>
  );
}