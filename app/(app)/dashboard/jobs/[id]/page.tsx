'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

type Job = { id: string; title: string; scheduled_for: string | null; status?: string | null };

export default function JobDetail() {
  const params = useParams() as { id?: string };
  const jobId = String(params?.id || '');
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      // maybeSingle so it never throws
      const { data } = await supabase
        .from('jobs')
        .select('id,title,scheduled_for,status')
        .eq('id', jobId)
        .maybeSingle();
      setJob(data ?? null);
    })();
  }, [jobId]);

  if (!job) return <main className="p-4">Loading…</main>;

  return (
    <main className="p-4 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{job.title}</h2>
        <a className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" href="/dashboard/jobs">Back</a>
      </div>
      <div className="rounded-md border p-3">
        <div className="text-sm text-gray-500 mb-1">Scheduled</div>
        <div>{job.scheduled_for ? new Date(job.scheduled_for).toLocaleString() : '—'}</div>
      </div>
    </main>
  );
}
