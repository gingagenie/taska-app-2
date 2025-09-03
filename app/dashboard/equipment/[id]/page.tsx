'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';

function CustomerSelect({ orgId, value, onChange }:{
  orgId: string; value?: string|null; onChange:(id:string|null)=>void
}) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [q, setQ] = useState(''); const [rows, setRows] = useState<{id:string;name:string}[]>([]);
  const t = useRef<number|null>(null);

  useEffect(() => {
    if (!orgId) return;
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(async () => {
      const { data } = await supabase.from('customers').select('id,name').eq('org_id', orgId).ilike('name', `%${q}%`).limit(20);
      setRows((data as any[]) ?? []);
    }, 200);
    return () => { if (t.current) window.clearTimeout(t.current); };
  }, [orgId, q]);

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">Customer</label>
      <input className="rounded-md border px-3 py-2" placeholder="Search customer…" value={q} onChange={e=>setQ(e.target.value)} />
      <select className="rounded-md border px-3 py-2" value={value ?? ''} onChange={e=>onChange(e.target.value || null)}>
        <option value="">Unassigned</option>
        {rows.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
    </div>
  );
}

export default function EquipmentEditPage() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const router = useRouter(); const p = useParams();
  const id = typeof p?.id === 'string' ? p.id : Array.isArray(p?.id) ? p.id[0] : '';

  const [make, setMake] = useState(''); const [model, setModel] = useState(''); const [serial, setSerial] = useState('');
  const [notes, setNotes] = useState(''); const [customerId, setCustomerId] = useState<string|null>(null);
  const [orgId, setOrgId] = useState(''); const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    supabase.from('profiles').select('active_org_id').single()
      .then(({ data }) => setOrgId(data?.active_org_id ?? ''));
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setErr(null);
      const { data, error } = await supabase
        .from('equipment')
        .select('id, make, model, serial_number, notes, customer_id')
        .eq('id', id)
        .single();
      if (error) setErr(error.message);
      setMake(data?.make ?? ''); setModel(data?.model ?? ''); setSerial(data?.serial_number ?? '');
      setNotes(data?.notes ?? ''); setCustomerId(data?.customer_id ?? null);
      setLoading(false);
    })();
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null);
    const { error } = await supabase.from('equipment').update({
      make: make.trim() || null,
      model: model.trim() || null,
      serial_number: serial.trim() || null,
      notes: notes.trim() || null,
      customer_id: customerId || null,
    }).eq('id', id);
    setSaving(false);
    if (error) return setErr(error.message);
    router.push('/dashboard/equipment');
  }

  async function remove() {
    if (!confirm('Delete this equipment?')) return;
    setDeleting(true); setErr(null);
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    setDeleting(false);
    if (error) return setErr(error.message);
    router.push('/dashboard/equipment');
  }

  if (!id) return <main className="p-4">Missing id</main>;
  if (loading) return <main className="p-4">Loading…</main>;

  return (
    <main className="grid gap-4 sm:gap-6 max-w-xl">
      <h1 className="text-xl font-semibold sm:text-2xl">Edit Equipment</h1>
      <form onSubmit={save} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Make</span>
          <input className="rounded-md border px-3 py-2" value={make} onChange={e=>setMake(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Model</span>
          <input className="rounded-md border px-3 py-2" value={model} onChange={e=>setModel(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Serial Number</span>
          <input className="rounded-md border px-3 py-2" value={serial} onChange={e=>setSerial(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Notes</span>
          <textarea className="rounded-md border px-3 py-2" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} />
        </label>

        <CustomerSelect orgId={orgId} value={customerId} onChange={setCustomerId} />

        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex gap-2">
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={remove} className="rounded-md border px-4 py-2 text-red-600 hover:bg-red-50" disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </form>
    </main>
  );
}