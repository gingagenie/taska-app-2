'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getActiveOrgIdClient } from '@/lib/getActiveOrgIdClient';

type Job = {
  id: string;
  title: string;
  scheduled_for: string | null;
  status?: string | null;
};

export default function Dashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [orgId, setOrgId] = useState('');
  const [today, setToday] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { orgId } = await getActiveOrgIdClient();
      setOrgId(orgId);
    })();
  }, []);

  useEffect(() => {
    if (!orgId) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      // load "today" (simple variant)
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date();   end.setHours(23,59,59,999);

      const { data } = await supabase
        .from('jobs')
        .select('id,title,scheduled_for,status')
        .eq('org_id', orgId)
        .gte('scheduled_for', start.toISOString())
        .lte('scheduled_for', end.toISOString())
        .order('scheduled_for', { ascending: true });

      setToday(data || []);
      setLoading(false);
    })();
  }, [orgId]);

  return (
    <main className="p-4">
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>

      {!orgId && (
        <div className="rounded-md border p-3 bg-amber-50 text-amber-900 mb-4">
          No active organization yet. Create one in <a className="underline" href="/dashboard/orgs">Orgs</a>.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h3 className="font-medium mb-2">Jobs Today</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : today.length === 0 ? (
            <div className="text-sm text-gray-500">No jobs today.</div>
          ) : (
            <ul className="space-y-2">
              {today.map(j => (
                <li key={j.id} className="flex items-center justify-between rounded-md border p-2">
                  <div>
                    <div className="font-medium">{j.title}</div>
                    <div className="text-xs text-gray-500">{j.scheduled_for ? new Date(j.scheduled_for).toLocaleString() : '—'}</div>
                  </div>
                  <a className="text-sm rounded-md border px-3 py-1 hover:bg-gray-50" href={`/dashboard/jobs/${j.id}`}>View</a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="font-medium mb-2">Upcoming Jobs</h3>
          <div className="text-sm text-gray-500">Coming soon.</div>
        </section>
      </div>
    </main>
  );
}
