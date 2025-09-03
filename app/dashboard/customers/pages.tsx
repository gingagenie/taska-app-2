'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Row = { id: string; name: string; email?: string|null; phone?: string|null };

export default function CustomersPage() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [orgId, setOrgId] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    supabase.from('profiles').select('active_org_id').single()
      .then(({ data, error }) => { if (error) setErr(error.message); setOrgId(data?.active_org_id ?? ''); });
  }, []);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      setLoading(true); setErr(null);
      const { data, error } = await supabase
        .from('customers')
        .select('id,name,email,phone')
        .eq('org_id', orgId)
        .order('name', { ascending: true })
        .limit(500);
      if (error) setErr(error.message);
      setRows((data as any[]) ?? []);
      setLoading(false);
    })();
  }, [orgId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      (r.name||'').toLowerCase().includes(s) ||
      (r.email||'').toLowerCase().includes(s) ||
      (r.phone||'').toLowerCase().includes(s)
    );
  }, [rows, q]);

  return (
    <main className="grid gap-4 sm:gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">Customers</h1>
        <Link href="/dashboard/customers/new">
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">+ Add Customer</button>
        </Link>
      </div>

      <input className="w-full max-w-xl rounded-md border px-3 py-2"
             placeholder="Search name, email, phone…" value={q} onChange={e=>setQ(e.target.value)} />

      {err && <p className="text-red-600">{err}</p>}
      {loading ? <p>Loading…</p> : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-sm text-gray-500">No customers.</div>
      ) : (
        <div className="grid gap-2">
          {filtered.map(c => (
            <Link key={c.id} href={`/dashboard/customers/${c.id}`} className="no-underline">
              <div className="rounded-xl border p-3 hover:bg-gray-50">
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-500">{c.email || '—'} {c.phone ? `• ${c.phone}` : ''}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}