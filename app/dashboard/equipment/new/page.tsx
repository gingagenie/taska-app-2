'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

// simple inline customer search-select (reuse pattern)
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

export default function EquipmentNewPage() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const router = useRouter();

  const [orgId, setOrgId] = useState('');
  const [make, setMake] = useState(''); const [model, setModel] = useState(''); const [serial, setSerial] = useState('');
  const [notes, setNotes] = useState('');
  const [customerId, setCustomerId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false); const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    supabase.from('profiles').select('active_org_id').single()
      .then(({ data, error }) => { if (error) setErr(error.message); setOrgId(data?.active_org_id ?? ''); });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!orgId) return setErr('No active org.');
    if (!make.trim() && !model.trim()) return setErr('Provide make or model.');

    setSaving(true);
    const { data, error } = await supabase.from('equipment').insert({
      org_id: orgId,
      customer_id: customerId || null,
      make: make.trim() || null,
      model: model.trim() || null,
      serial_number: serial.trim() || null,
      notes: notes.trim() || null,
    }).select('id').single();
    setSaving(false);
    if (error) return setErr(error.message);
    router.push(`/dashboard/equipment/${data!.id}`);
  }

  return (
    <main className="grid gap-4 sm:gap-6 max-w-xl">
      <h1 className="text-xl font-semibold sm:text-2xl">Add Equipment</h1>

      <form onSubmit={submit} className="grid gap-3">
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
          <a href="/dashboard/equipment" className="rounded-md border px-4 py-2 hover:bg-gray-50">Cancel</a>
        </div>
      </form>
    </main>
  );
}