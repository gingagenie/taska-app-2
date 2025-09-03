'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

function StatusBadge({ status }: { status?: string | null }) {
  const s = (status ?? 'draft').toLowerCase();
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-amber-100 text-amber-800',
    on_hold: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[s] ?? map.draft}`}>
      {s.replace('_', ' ')}
    </span>
  );
}

type Row = {
  id: string;
  title: string;
  status: string | null;
  scheduled_for: string | null;
  customer?: { id: string; name: string } | null;
};

const STATUS_FILTERS = ['all','draft','scheduled','in_progress','on_hold','completed','cancelled'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

export default function JobsIndexPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [orgId, setOrgId] = useState<string>('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  useEffect(() => {
    supabase.from('profiles').select('active_org_id').single()
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        setOrgId(data?.active_org_id ?? '');
      });
  }, []);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      setLoading(true); setErr(null);
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id, title, status, scheduled_for,
          customer:customers ( id, name )
        `)
        .eq('org_id', orgId)
        .order('scheduled_for', { ascending: false })
        .limit(400);
      if (error) setErr(error.message);
      setRows((data as any[]) || []);
      setLoading(false);
    })();
  }, [orgId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      const matchesQ =
        !q ||
        (r.title || '').toLowerCase().includes(q) ||
        (r.customer?.name || '').toLowerCase().includes(q);

      const matchesS = status === 'all' || (r.status ?? 'draft').toLowerCase() === status;
      return matchesQ && matchesS;
    });
  }, [rows, query, status]);

  async function markCompleted(id: string) {
    // optimistic
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
    const { error } = await supabase.from('jobs').update({ status: 'completed' }).eq('id', id);
    if (error) {
      // revert (in practice we’d store prev status per-row; here it’s fine)
      setErr(error.message);
      await reload(); // reload from server as fallback
    }
  }

  async function reload() {
    if (!orgId) return;
    const { data } = await supabase
      .from('jobs')
      .select(`id, title, status, scheduled_for, customer:customers ( id, name )`)
      .eq('org_id', orgId)
      .order('scheduled_for', { ascending: false })
      .limit(400);
    setRows((data as any[]) || []);
  }

  return (
    <main className="grid gap-4 sm:gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">Jobs</h1>
        <Link href="/dashboard/jobs/new">
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">+ New Job</button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="w-full max-w-xl rounded-md border px-3 py-2"
          placeholder="Search jobs or customer…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Status</label>
          <select
            className="rounded-md border px-2 py-2 text-sm"
            value={status}
            onChange={(e)=> setStatus(e.target.value as StatusFilter)}
          >
            {STATUS_FILTERS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
        </div>
      </div>

      {err && <p className="text-red-600">{err}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-sm text-gray-500">
          No jobs match your filters.
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map(j => {
            const when = j.scheduled_for ? new Date(j.scheduled_for).toLocaleString() : '—';
            const isCompleted = (j.status ?? '').toLowerCase() === 'completed';
            return (
              <div key={j.id} className="rounded-xl border p-3 hover:bg-gray-50">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left */}
                  <div className="min-w-0">
                    <div className="truncate font-medium">{j.title}</div>
                    <div className="truncate text-sm text-gray-500">{j.customer?.name ?? '—'}</div>
                  </div>

                  {/* Right actions */}
                  <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <div className="text-sm text-gray-600">{when}</div>
                    <StatusBadge status={j.status} />
                    {!isCompleted && (
                      <button
                        onClick={() => markCompleted(j.id)}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
                      >
                        Complete
                      </button>
                    )}
                    <Link href={`/dashboard/jobs/${j.id}`} className="rounded-md border px-3 py-1.5 text-sm">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
