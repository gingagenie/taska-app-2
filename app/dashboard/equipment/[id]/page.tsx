'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

type Equip = {
  id: string;
  customer_id: string | null;
  make: string | null;
  model: string | null;
  serial_number: string | null;
  notes: string | null;
};

export default function EquipmentEditPage() {
  // ✅ useParams is non-null in App Router; cast for TS
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [equip, setEquip] = useState<Equip | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // local form state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!id) return; // defensive guard
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from('equipment')
        .select('id, customer_id, make, model, serial_number, notes')
        .eq('id', id)
        .single();

      if (error) {
        setErr(error.message);
      } else if (data) {
        setEquip(data as Equip);
        setMake(data.make ?? '');
        setModel(data.model ?? '');
        setSerial(data.serial_number ?? '');
        setNotes(data.notes ?? '');
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    if (!id) return;
    const { error } = await supabase
      .from('equipment')
      .update({
        make: make || null,
        model: model || null,
        serial_number: serial || null,
        notes: notes || null,
      })
      .eq('id', id);

    if (error) {
      setErr(error.message);
    } else {
      router.push('/dashboard/equipment');
    }
  }

  if (!id) {
    return <main className="p-6"><p>Missing equipment id.</p></main>;
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Equipment</h1>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: 'crimson' }}>{err}</p>}

      {!loading && equip && (
        <div className="grid gap-3 max-w-lg">
          <label className="grid gap-1">
            <span className="text-sm">Make</span>
            <input className="rounded border px-3 py-2" value={make} onChange={e=>setMake(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Model</span>
            <input className="rounded border px-3 py-2" value={model} onChange={e=>setModel(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Serial Number</span>
            <input className="rounded border px-3 py-2" value={serial} onChange={e=>setSerial(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Notes</span>
            <textarea className="rounded border px-3 py-2" rows={4} value={notes} onChange={e=>setNotes(e.target.value)} />
          </label>

          <div className="flex gap-2 mt-2">
            <button onClick={save} className="rounded bg-blue-600 px-3 py-2 text-white">Save</button>
            <button onClick={() => router.back()} className="rounded border px-3 py-2">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}
