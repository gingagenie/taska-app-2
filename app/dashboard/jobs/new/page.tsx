' client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function NewJobPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const [orgId, setOrgId] = useState('');
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    supabase.from('profiles').select('active_org_id').single()
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        setOrgId(data?.active_org_id ?? '');
      });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!orgId) return setErr('No active org selected.');
    if (!title.trim()) return setErr('Title is required.');

    setSaving(true);
    const scheduled_for = when ? new Date(when).toISOString() : new Date().toISOString();

    const { error } = await supabase
      .from('jobs')
      .insert({ org_id: orgId, title: title.trim(), scheduled_for, status: 'scheduled' });

    setSaving(false);
    if (error) return setErr(error.message);
    router.push('/dashboard');
  };

  return (
    <main style={{ maxWidth: 560, margin: '24px auto' }}>
      <h1 style={{ fontWeight: 600, fontSize: 24, marginBottom: 12 }}>New Job</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div>Title</div>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="e.g. Replace water pump" required />
        </label>
        <label>
          <div>Scheduled for</div>
          <input type="datetime-local" value={when} onChange={(e)=>setWhen(e.target.value)} />
        </label>
        <div style={{ display:'flex', gap:8 }}>
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create Job'}</button>
          <a href="/dashboard"><button type="button">Cancel</button></a>
        </div>
        {err && <p style={{ color:'crimson' }}>{err}</p>}
        <small style={{ color:'#666' }}>Active org: {orgId || '—'}</small>
      </form>
    </main>
  );
}
