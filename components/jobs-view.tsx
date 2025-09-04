'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

type JobRowRaw = {
  id: string;
  org_id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  customer_id: string | null;
  // Supabase can return this as an array or an object depending on FK metadata.
  customers?: { name: string | null } | { name: string | null }[] | null;
};

type Job = {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  status: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  customer_id: string | null;
  customer_name: string | null;
};

export default function JobsView({ orgId }: { orgId: string }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      setLoading(true);

      // Prefer a 1:1 relation select. If FK is missing, PostgREST may still return an array.
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          org_id,
          title,
          description,
          status,
          scheduled_date,
          scheduled_time,
          customer_id,
          customers:customer_id ( name )
        `)
        .eq('org_id', orgId)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
      } else {
        const normalized = (data as JobRowRaw[]).map((row) => {
          // Normalize customers to a single name
          let customer_name: string | null = null;
          const c = row.customers;
          if (Array.isArray(c)) {
            customer_name = c[0]?.name ?? null;
          } else if (c && typeof c === 'object') {
            // @ts-expect-error – runtime guard above ensures name exists or null
            customer_name = c.name ?? null;
          }

          return {
            id: row.id,
            org_id: row.org_id,
            title: row.title ?? '(Untitled job)',
            description: row.description ?? null,
            status: row.status ?? null,
            scheduled_date: row.scheduled_date ?? null,
            scheduled_time: row.scheduled_time ?? null,
            customer_id: row.customer_id,
            customer_name,
          } as Job;
        });

        setJobs(normalized);
      }

      setLoading(false);
    })();
  }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p>Loading jobs…</p>;

  return (
    <section className="space-y-3">
      {jobs.length === 0 ? (
        <div className="t-card">
          <div className="font-medium">No jobs yet</div>
          <p className="text-sm text-gray-500">Create your first job to get started.</p>
          <Link href="/dashboard/jobs/new" className="t-btn t-btn--primary mt-3 inline-block">+ New Job</Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center justify-between rounded-xl border p-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{j.title}</div>
                <div className="text-sm text-gray-500">
                  {j.customer_name ?? '—'} • {j.scheduled_date ?? '—'} {j.scheduled_time ?? ''}
                </div>
              </div>
              <Link
                href={`/dashboard/jobs/${j.id}`}
                className="t-btn"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
