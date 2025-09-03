'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getActiveOrgIdClient } from '@/lib/getActiveOrgIdClient';

export default function JobNew() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [orgId, setOrgId] = useState('');
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState<string>('');

  useEffect(() => { (async () => {
    const { orgId } = await getActiveOrgIdClient(); setOrgId(orgId);
  })(); }, []);

  async function save() {
    if (!orgId) { alert('Create or switch to an org first.'); return; }
    const { error, data } = await supabase
      .from('jobs')
      .insert({ org_id: orgId, title, scheduled_for: when || null })
      .select('id')
      .maybeSingle();

    if (error) return alert(error.message);
    if (data?.id) window.location.href = `/dashboard/jobs/${data.id}`;
    else window.location.href = '/dashboard/jobs';
  }

  return (
    <main className="p-4 max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Add Job</h2>
      <div className="space-y-3">
        <input className="w-full rounded-md border px-3 py-2" placeholder="Job title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input type="datetime-local" className="w-full rounded-md border px-3 py-2" value={when} onChange={e=>setWhen(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={save} className="rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700">Save</button>
          <a className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50" href="/dashboard/jobs">Cancel</a>
        </div>
      </div>
    </main>
  );
}
