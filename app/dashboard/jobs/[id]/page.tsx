'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';

/** ---------- Inline Status components ---------- */

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
      {s.replace('_',' ')}
    </span>
  );
}

function StatusDropdown({
  jobId, initialStatus = 'draft', onChanged,
}: { jobId: string; initialStatus?: string; onChanged?: (s:string)=>void }) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const STATUSES = ['draft','scheduled','in_progress','on_hold','completed','cancelled'] as const;

  async function updateStatus(next: string) {
    if (busy || next === status) return;
    const prev = status;
    setStatus(next); setBusy(true);
    const { error } = await supabase.from('jobs').update({ status: next }).eq('id', jobId);
    if (error) setStatus(prev); else onChanged?.(next);
    setBusy(false);
  }

  return (
    <select className="rounded-md border px-2 py-1 text-sm" disabled={busy}
            value={status} onChange={e=>updateStatus(e.target.value)}>
      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
    </select>
  );
}

/** ----------------- Page ------------------- */

type EquipRow = { equipment: { id: string; make: string|null; model: string|null; serial_number: string|null } };
type NoteRow = { id: string; body: string; created_at: string; created_by?: string|null };

export default function JobDetailPage() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const router = useRouter();
  const p = useParams();
  const jobId = typeof p?.id === 'string' ? p.id : Array.isArray(p?.id) ? p.id[0] : '';

  const [job, setJob] = useState<any | null>(null);
  const [equip, setEquip] = useState<EquipRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function loadAll() {
    if (!jobId) return;
    setLoading(true); setErr(null);

    // Job + relations
    const { data: j, error } = await supabase
      .from('jobs')
      .select(`
        id, title, status, scheduled_for, customer_id,
        customers:customer_id ( id, name, email )
      `)
      .eq('id', jobId)
      .single();

    if (error) { setErr(error.message); setLoading(false); return; }
    setJob(j);

    // Equipment
    const { data: eq } = await supabase
      .from('job_equipment')
      .select(`
        equipment:equipment_id ( id, make, model, serial_number )
      `)
      .eq('job_id', jobId);

    setEquip((eq as any[]) ?? []);

    // Notes
    const { data: ns } = await supabase
      .from('job_notes')
      .select('id, body, created_at, created_by')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    setNotes((ns as any[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [jobId]);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    const { error } = await supabase.from('job_notes').insert({ job_id: jobId, body: noteText.trim() });
    if (!error) { setNoteText(''); await loadAll(); }
  }

  return (
    <main className="grid gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{job?.title ?? 'Job'}</h1>
          <StatusBadge status={job?.status} />
        </div>
        <div className="flex items-center gap-3">
          {job && (
            <StatusDropdown
              jobId={job.id}
              initialStatus={job.status ?? 'draft'}
              onChanged={(s)=> setJob((prev:any)=> ({...prev, status:s}))}
            />
          )}
          <a href="/dashboard/jobs" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">All Jobs</a>
        </div>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : err ? (
        <p className="text-red-600">{err}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Overview */}
          <section className="rounded-xl border p-4 lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold">Overview</h2>
            <div className="grid gap-2 text-sm">
              <div><span className="font-medium">Scheduled:</span> {job?.scheduled_for ? new Date(job.scheduled_for).toLocaleString() : '—'}</div>
              <div><span className="font-medium">Customer:</span> {job?.customers?.name ?? '—'}</div>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 font-medium">Equipment</h3>
              {equip.length === 0 ? (
                <p className="text-sm text-gray-500">No equipment linked.</p>
              ) : (
                <ul className="grid gap-2">
                  {equip.map((row, i) => (
                    <li key={row.equipment.id ?? i} className="rounded-md border p-2 text-sm">
                      <div className="font-medium">{row.equipment.make ?? 'Equipment'} {row.equipment.model ?? ''}</div>
                      <div className="text-gray-500">SN: {row.equipment.serial_number ?? '—'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Right: Notes */}
          <aside className="rounded-xl border p-4">
            <h2 className="mb-3 text-lg font-semibold">Notes</h2>

            <form onSubmit={addNote} className="mb-3 grid gap-2">
              <textarea
                className="min-h-[80px] rounded-md border px-3 py-2 text-sm"
                placeholder="Add a note…"
                value={noteText}
                onChange={(e)=> setNoteText(e.target.value)}
              />
              <div className="flex gap-2">
                <button className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 text-sm">
                  Add note
                </button>
                <button type="button" onClick={()=>setNoteText('')} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
                  Clear
                </button>
              </div>
            </form>

            {notes.length === 0 ? (
              <p className="text-sm text-gray-500">No notes yet.</p>
            ) : (
              <ul className="grid gap-2">
                {notes.map(n => (
                  <li key={n.id} className="rounded-md border p-2">
                    <div className="text-sm">{n.body}</div>
                    <div className="mt-1 text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
