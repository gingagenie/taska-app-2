'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Job = {
  id: string;
  org_id: string;
  title: string;
  scheduled_for: string | null;
  address_id: string | null;
};

export default function Dashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [session, setSession] = useState<any>(null);
  const [orgId, setOrgId] = useState<string>('');
  const [jobsToday, setJobsToday] = useState<Job[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('active_org_id').single();
    setOrgId(data?.active_org_id || '');
  };

  const loadJobsToday = async () => {
    if (!orgId) return;
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start); end.setDate(start.getDate() + 1);
    const { data } = await supabase
      .from('jobs')
      .select('id, org_id, title, scheduled_for, address_id')
      .gte('scheduled_for', start.toISOString())
      .lt('scheduled_for', end.toISOString())
      .eq('org_id', orgId)
      .order('scheduled_for', { ascending: true });
    setJobsToday(data || []);
  };

  useEffect(() => { loadProfile(); /* eslint-disable-next-line */ }, [session]);
  useEffect(() => { loadJobsToday(); /* eslint-disable-next-line */ }, [orgId]);

  const createOrg = async () => {
    const name = prompt('Org name?') || 'My Org';
    const { error } = await supabase.rpc('create_org_and_join', { p_name: name });
    if (error) alert(error.message);
    else { await loadProfile(); await loadJobsToday(); }
  };

  const createJob = async () => {
    if (!orgId) return alert('No active org yet.');
    const when = new Date().toISOString();
    const { error } = await supabase.from('jobs').insert({ org_id: orgId, title: newTitle, scheduled_for: when });
    if (error) alert(error.message);
    setNewTitle('');
    await loadJobsToday();
  };

  const navToJob = async (job: Job) => {
    const { data } = await supabase
      .from('addresses')
      .select('line1, city, state, postcode')
      .eq('id', job.address_id)
      .single();
    const addr = [data?.line1, data?.city, data?.state, data?.postcode].filter(Boolean).join(' ');
    const url = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(addr || '');
    window.location.href = url;
  };

  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  return (
    <main>
      <h2>Dashboard</h2>
      {!session && <p>Not logged in. <a href="/">Go home</a></p>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button onClick={createOrg}>Create Org</button>
        <a href="/dashboard/orgs/settings">
          <button>Org Settings</button>
        </a>
        <a href="/dashboard/orgs">
          <button>Orgs</button>
        </a>
        <button onClick={loadJobsToday}>Refresh Today</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="New job title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button onClick={createJob}>Add Job Now</button>
      </div>

      <h3>Today&apos;s Jobs</h3>
      <ul style={{ paddingLeft: 16 }}>
        {jobsToday.map((j) => (
          <li key={j.id} style={{ marginBottom: 8 }}>
            <strong>{new Date(j.scheduled_for || '').toLocaleTimeString()}</strong> — {j.title}{' '}
            <button onClick={() => navToJob(j)}>Navigate</button>
          </li>
        ))}
        {jobsToday.length === 0 && <li>No jobs today.</li>}
      </ul>

      <small style={{ color: '#666' }}>
        Active org: <code>{orgId || 'none'}</code> • Site: <code>{site}</code>
      </small>
    </main>
  );
}
