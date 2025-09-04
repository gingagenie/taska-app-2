'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

type Job = {
  id: string;
  title: string;
  scheduled_for: string | null;
  org_id: string;
};

export default function Dashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [orgId, setOrgId] = useState<string | null>(null);
  const [ensuring, setEnsuring] = useState(true);
  const [jobsToday, setJobsToday] = useState<Job[]>([]);

  // Safety net: ensure org on mount
  useEffect(() => {
    (async () => {
      try {
        await fetch('/api/ensure-org', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      } catch (_) {}
      // load profile/org id afterwards
      const { data } = await supabase.from('profiles').select('active_org_id').single();
      setOrgId((data?.active_org_id as string) || null);
      setEnsuring(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const end = new Date(start); end.setDate(start.getDate() + 1);

      const { data } = await supabase
        .from('jobs')
        .select('id,title,scheduled_for,org_id')
        .eq('org_id', orgId)
        .gte('scheduled_for', start.toISOString())
        .lt('scheduled_for', end.toISOString())
        .order('scheduled_for', { ascending: true });

      setJobsToday((data as any) || []);
    })();
  }, [orgId, supabase]);

  return (
    <main className="p-4">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <Link href="/dashboard/jobs/new" className="rounded-md border px-3 py-2 hover:bg-gray-50">+ New Job</Link>
      </header>

      {ensuring && <p>Preparing your workspace…</p>}

      {!ensuring && !orgId && (
        <div className="rounded-md border p-4">
          <p className="mb-2 font-medium">No active org yet.</p>
          <button
            className="rounded-md bg-blue-600 px-3 py-2 text-white"
            onClick={async () => {
              await fetch('/api/ensure-org', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
              const { data } = await supabase.from('profiles').select('active_org_id').single();
              setOrgId((data?.active_org_id as string) || null);
            }}
          >
            Fix my org
          </button>
        </div>
      )}

      {orgId && (
        <>
          <h3 className="mt-6 mb-2 text-lg font-semibold">Today’s Jobs</h3>
          <ul className="space-y-2">
            {jobsToday.map((j) => (
              <li key={j.id} className="flex items-center justify-between rounded-md border p-3">
                <span className="font-medium">{j.title}</span>
                <Link href={`/dashboard/jobs/${j.id}`} className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50">
                  View
                </Link>
              </li>
            ))}
            {jobsToday.length === 0 && <li className="text-gray-500">No jobs today.</li>}
          </ul>
        </>
      )}
    </main>
  );
}
