'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

type Job = {
  id: string; title: string; status: string | null; scheduled_for: string | null; description: string | null;
  customer?: { id: string; name: string } | null;
  site?: { id: string; line1: string | null; city: string | null; state: string | null; postcode: string | null } | null;
};

export default function JobPage() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const params = useParams(); const router = useRouter();
  const jobId = String(params.id);
  const [job, setJob] = useState<Job | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [equip, setEquip] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [noteBody, setNoteBody] = useState('');

  useEffect(() => {
    (async () => {
      const { data: j, error } = await supabase
        .from('jobs')
        .select(`
          id, title, status, scheduled_for, description,
          customer:customers ( id, name ),
          site:customer_addresses ( id, line1, city, state, postcode )
        `)
        .eq('id', jobId).single();
      if (error) setErr(error.message);
      setJob(j as any);

      const { data: n } = await supabase
        .from('job_notes')
        .select('id, body, created_at')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      setNotes(n || []);

      const { data: e } = await supabase
        .from('job_equipment')
        .select('equipment(id, serial_number, notes)')
        .eq('job_id', jobId);
      setEquip((e || []).map((x: any) => x.equipment));
    })();
  }, [jobId]);

  const addNote = async () => {
    if (!noteBody.trim()) return;
    const { error } = await supabase.from('job_notes').insert({ job_id: jobId, body: noteBody.trim() });
    if (error) return setErr(error.message);
    setNoteBody('');
    const { data: n } = await supabase.from('job_notes').select('id, body, created_at').eq('job_id', jobId).order('created_at', { ascending: false });
    setNotes(n || []);
  };

  if (err) return <main><p style={{color:'crimson'}}>Error: {err}</p></main>;
  if (!job) return <main><p>Loading…</p></main>;

  const when = job.scheduled_for ? new Date(job.scheduled_for).toLocaleString() : '—';
  const site = job.site ? [job.site.line1, job.site.city, job.site.state, job.site.postcode].filter(Boolean).join(', ') : '—';

  return (
    <main style={{ maxWidth: 900, margin: '24px auto', display:'grid', gap:16 }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{fontWeight:700, fontSize:24}}>{job.title}</h1>
        <button onClick={() => router.push('/dashboard')}>Back to Dashboard</button>
      </div>

      <section style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
        <h2 style={{fontWeight:600, marginBottom:8}}>Overview</h2>
        <div>Status: <strong>{job.status || 'new'}</strong></div>
        <div>Scheduled: {when}</div>
        <div>Customer: {job.customer?.name || '—'}</div>
        <div>Site: {site}</div>
        <div>Description: {job.description || '—'}</div>
      </section>

      <section style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
        <h2 style={{fontWeight:600, marginBottom:8}}>Equipment</h2>
        {equip.length === 0 ? <div>No equipment linked.</div> : (
          <ul>{equip.map((e:any) => <li key={e.id}><code>{e.serial_number}</code> — {e.notes || ''}</li>)}</ul>
        )}
      </section>

      <section style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
        <h2 style={{fontWeight:600, marginBottom:8}}>Notes</h2>
        <div style={{display:'flex', gap:8, marginBottom:8}}>
          <input placeholder="Add a note…" value={noteBody} onChange={(e)=>setNoteBody(e.target.value)} />
          <button onClick={addNote}>Add</button>
        </div>
        {notes.length === 0 ? <div>No notes yet.</div> : (
          <ul>
            {notes.map(n => <li key={n.id}><small>{new Date(n.created_at).toLocaleString()}</small><br/>{n.body}</li>)}
          </ul>
        )}
      </section>
    </main>
  );
}
