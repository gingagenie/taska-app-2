'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import JobsView from '@/components/jobs-view';

export default function JobsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('profiles').select('active_org_id').single();
        setOrgId((data?.active_org_id as string) || null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <main className="p-4">Loading…</main>;
  if (!orgId) {
    return (
      <main className="p-4">
        <div className="t-card">
          <div className="font-medium">No active org yet</div>
          <p className="text-sm text-gray-500">Create or activate an org first.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold mb-4">Jobs</h1>
      <JobsView orgId={orgId} />
    </main>
  );
}
