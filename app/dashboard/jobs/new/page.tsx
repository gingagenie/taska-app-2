'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

/** --------- Tiny inline components (no extra files) ---------- */

// CustomerSelect (no lodash, simple debounce)
function CustomerSelect({
  orgId, value, onChange,
}: { orgId: string; value?: string | null; onChange: (id:string|null)=>void }) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [q, setQ] = useState(''); const [rows, setRows] = useState<{id:string;name:string;email?:string|null}[]>([]);
  const t = useRef<number | null>(null);

  useEffect(() => {
    if (!orgId) return;
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id,name,email')
        .eq('org_id', orgId)
        .ilike('name', `%${q}%`)
        .limit(20);
      if (!error) setRows((data as any[]) ?? []);
    }, 200);
    return () => { if (t.current) window.clearTimeout(t.current); };
  }, [orgId, q]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Customer</label>
      <input className="w-full rounded-md border px-3 py-2" placeholder="Search customer…"
             value={q} onChange={e=>setQ(e.target.value)} />
      <select className="w-full rounded-md border px-3 py-2"
              value={value ?? ''} onChange={(e)=>onChange(e.target.value || null)}>
        <option value="">No customer</option>
        {rows.map(r => <option key={r.id} value={r.id}>{r.name}{r.email ? ` — ${r.email}`:''}</option>)}
      </select>
    </div>
  );
}

// EquipmentMultiSelect (filtered by customer, no extra deps)
function EquipmentMultiSelect({
  orgId, customerId, value, onChange,
}: { orgId: string; customerId?: string | null; value: string[]; onChange: (ids:string[])=>void }) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      let q = supabase.from('equipment').select('id,make,model,serial_number').eq('org_id', orgId);
      if (customerId) q = q.eq('customer_id', customerId);
      const { data } = await q.order('make', { ascending: true }).limit(100);
      setRows(data ?? []);
    })();
  }, [orgId, customerId]);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter(x=>x!==id) : [...value, id]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Equipment (optional)</label>
      <div className="grid gap-2">
        {rows.map(e => {
          const checked = value.includes(e.id);
          return (
            <label key={e.id} className="flex items-center gap-2 rounded-md border p-2">
              <input type="checkbox" checked={checked} onChange={()=>toggle(e.id)} />
              <div className="text-sm">
                <div className="font-medium">{e.make ?? 'Equipment'} {e.model ?? ''}</div>
                <div className="text-gray-500">SN: {e.serial_number ?? '—'}</div>
              </div>
            </label>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-gray-500">No equipment found.</p>}
      </div>
    </div>
  );
}

/** ----------------- Page ------------------- */

export default function NewJobPage() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const router = useRouter();

  const [orgId, setOrgId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [whenLocal, setWhenLocal] = useState<string>(''); // datetime-local string
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [equipIds, setEquipIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load active org
  useEffect(() => {
    supabase.from('profiles').select('active_org_id').single()
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        setOrgId(data?.active_org_id ?? '');
      });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!orgId) return setErr('No active org.');
    if (!title.trim()) return setErr('Title is required.');
    if (!whenLocal) return setErr('Scheduled date/time is required.');

    // Convert local datetime to ISO string (UTC)
    const scheduledISO = new Date(whenLocal).toISOString();

    setSaving(true);
    // 1) create job
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        org_id: orgId,
        title: title.trim(),
        scheduled_for: scheduledISO,
        customer_id: customerId || null,   // column exists in your schema
      })
      .select('id')
      .single();

    if (error || !job) {
      setSaving(false);
      return setErr(error?.message || 'Create failed.');
    }

    // 2) attach equipment (if any)
    if (equipIds.length > 0) {
      const rows = equipIds.map(eid => ({ job_id: job.id, equipment_id: eid }));
      await supabase.from('job_equipment').upsert(rows);
      // ignore errors here for now; can add UI later
    }

    setSaving(false);
    router.push(`/dashboard/jobs/${job.id}`);
  }

  return (
    <main className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Job</h1>
      </div>

      <form onSubmit={handleCreate} className="grid gap-4 max-w-2xl">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Title</label>
          <input className="rounded-md border px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Scheduled for</label>
          <input
            type="datetime-local"
            className="rounded-md border px-3 py-2"
            value={whenLocal}
            onChange={e=>setWhenLocal(e.target.value)}
          />
        </div>

        {/* Customer + Equipment */}
        <CustomerSelect orgId={orgId} value={customerId} onChange={setCustomerId} />
        <EquipmentMultiSelect orgId={orgId} customerId={customerId} value={equipIds} onChange={setEquipIds} />

        {err && <p className="text-sm text-red-600">{err}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            {saving ? 'Creating…' : 'Create Job'}
          </button>
          <a href="/dashboard/jobs" className="rounded-md border px-4 py-2 hover:bg-gray-50">Cancel</a>
        </div>
      </form>
    </main>
  );
}
