'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getActiveOrgIdClient } from '@/lib/getActiveOrgIdClient';

type Row = { id: string; title: string; scheduled_for: string | null; status?: string | null };

export default function JobsList() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [orgId, setOrgId] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => { (async () => {
    const { orgId } = await getActiveOrgIdClient(); setOrgId(orgId);
  })(); }, []);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      let req = supabase.from('jobs')
        .select('id,title,scheduled_for,status')
        .eq('org_id', orgId)
        .order('scheduled_for', { ascending: true })
        .limit(100);
      if (q) req = req.ilike('title', `%${q}%`);
      const { data } = await req;
      setRows(data || []);
    })();
  }, [orgId, q]);

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Jobs</h2>
        <a className="rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700" href="/dashboard/jobs/new">+ New Job</a>
      </div>

      <input className="w-full max-w-md rounded-md border px-3 py-2 mb-3" placeholder="Search jobs…" value={q} onChange={e=>setQ(e.target.value)} />

      <ul className="space-y-2">
        {rows.map(j => (
          <li key={j.id} className="flex items-center justify-between rounded-md border p-2">
            <div>
              <div className="font-medium">{j.title}</div>
              <div className="text-xs text-gray-500">{j.scheduled_for ? new Date(j.scheduled_for).toLocaleString() : '—'}</div>
            </div>
            <a className="text-sm rounded-md border px-3 py-1 hover:bg-gray-50" href={`/dashboard/jobs/${j.id}`}>View</a>
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-gray-500">No jobs yet.</li>}
      </ul>
    </main>
  );
}
