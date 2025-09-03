'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// Tiny badge (no extra files)
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

type JobRow = {
  id: string;
  org_id: string;
  title: string;
  status: string | null;
  scheduled_for: string | null;
  customer?: { id: string; name: string } | null;
  site?: { id: string; line1: string | null; city: string | null; state: string | null; postcode: string | null } | null;
};

export default function DashboardPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [orgId, setOrgId] = useState<string>('');
  const [todayJobs, setTodayJobs] = useState<JobRow[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // helper: ISO range for today and next 7 days (UTC based; good enough for now)
  function dayRangeISO(daysFromNow = 0, daysSpan = 1) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + daysFromNow);

    const end = new Date(start);
    end.setDate(end.getDate() + daysSpan);

    return { startISO: start.toISOString(), endISO: end.toISOString() };
  }

  useEffect(() => {
    supabase.from('profiles').select('active_org_id').single().then(({ data, error }) => {
      if (error) setErr(error.message);
      setOrgId(data?.active_org_id ?? '');
    });
  }, []);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      setLoading(true); setErr(null);

      // Today
      const { startISO: tStart, endISO: tEnd } = dayRangeISO(0, 1);
      const { data: t, error: tErr } = await supabase
        .from('jobs')
        .select(`
          id, org_id, title, status, scheduled_for,
          customer:customers ( id, name ),
          site:customer_addresses ( id, line1, city, state, postcode )
        `)
        .eq('org_id', orgId)
        .gte('scheduled_for', tStart)
        .lt('scheduled_for', tEnd)
        .order('scheduled_for', { ascending: true })
        .limit(50);
      if (tErr) setErr(tErr.message);
      setTodayJobs((t as any[]) ?? []);

      // Upcoming (next 7 days)
      const { startISO: uStart, endISO: uEnd } = dayRangeISO(1, 7);
      const { data: u, error: uErr } = await supabase
        .from('jobs')
        .select(`
          id, org_id, title, status, scheduled_for,
          customer:customers ( id, name ),
          site:customer_addresses ( id, line1, city, state, postcode )
        `)
        .eq('org_id', orgId)
        .gte('scheduled_for', uStart)
        .lt('scheduled_for', uEnd)
        .order('scheduled_for', { ascending: true })
        .limit(100);
      if (uErr) setErr(uErr.message);
      setUpcomingJobs((u as any[]) ?? []);

      setLoading(false);
    })();
  }, [orgId]);

  const emptyToday = !loading && todayJobs.length === 0;
  const emptyUpcoming = !loading && upcomingJobs.length === 0;

  return (
    <main className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/jobs/new"><button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">+ New Job</button></Link>
          <Link href="/dashboard/jobs"><button className="rounded-md border px-4 py-2 hover:bg-gray-50">All Jobs</button></Link>
        </div>
      </div>

      {err && <p className="text-red-600">{err}</p>}

      {/* Two-column panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Jobs Today */}
        <section className="rounded-2xl border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Jobs Today</h2>
            <Link href="/dashboard/jobs/new" className="text-sm text-blue-600 hover:underline">Add</Link>
          </div>

          {loading ? (
            <p>Loading…</p>
          ) : emptyToday ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-gray-500">
              No jobs scheduled for today. <Link href="/dashboard/jobs/new" className="text-blue-600 hover:underline">Create one →</Link>
            </div>
          ) : (
            <ul className="grid gap-2">
              {todayJobs.map((j) => {
                const when = j.scheduled_for ? new Date(j.scheduled_for).toLocaleTimeString() : '—';
                const site = j.site ? [j.site.line1, j.site.city, j.site.state, j.site.postcode].filter(Boolean).join(', ') : '';
                return (
                  <li key={j.id} className="flex items-center justify-between rounded-xl border p-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{j.title}</div>
                      <div className="truncate text-sm text-gray-500">
                        {j.customer?.name ? `${j.customer.name} • ` : ''}{site || '—'}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-sm text-gray-600">{when}</div>
                      <StatusBadge status={j.status} />
                      <Link href={`/dashboard/jobs/${j.id}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">View</Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Upcoming Jobs (7 days) */}
        <section className="rounded-2xl border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming (7 days)</h2>
            <Link href="/dashboard/jobs" className="text-sm text-blue-600 hover:underline">See all</Link>
          </div>

          {loading ? (
            <p>Loading…</p>
          ) : emptyUpcoming ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-gray-500">
              Nothing scheduled in the next week.
            </div>
          ) : (
            <ul className="grid gap-2">
              {upcomingJobs.slice(0, 8).map((j) => {
                const when = j.scheduled_for ? new Date(j.scheduled_for).toLocaleString() : '—';
                return (
                  <li key={j.id} className="flex items-center justify-between rounded-xl border p-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{j.title}</div>
                      <div className="truncate text-sm text-gray-500">{j.customer?.name ?? '—'}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-sm text-gray-600">{when}</div>
                      <StatusBadge status={j.status} />
                      <Link href={`/dashboard/jobs/${j.id}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">View</Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}