'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';

type Customer = { id: string; name: string | null };

export default function EditEquipmentPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [orgId, setOrgId] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  // fields
  const [customerId, setCustomerId] = useState<string>('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // org
      const { data: prof } = await supabase.from('profiles').select('active_org_id').single();
      const oid = prof?.active_org_id as string;
      setOrgId(oid || '');

      // load dropdown customers
      if (oid) {
        const { data: rows } = await supabase
          .from('customers')
          .select('id,name')
          .eq('org_id', oid)
          .order('name', { ascending: true });
        setCustomers((rows || []) as Customer[]);
      }

      // load equipment
      const { data: eq, error } = await supabase
        .from('equipment')
        .select('id, customer_id, make, model, serial_number, notes')
        .eq('id', params.id)
        .single();

      if (error) setErr(error.message);
      else if (eq) {
        setCustomerId(eq.customer_id ?? '');
        setMake(eq.make ?? '');
        setModel(eq.model ?? '');
        setSerial(eq.serial_number ?? '');
        setNotes(eq.notes ?? '');
      }

      setLoading(false);
    })();
  }, [params.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!make.trim()) return setErr('Make is required.');
    setSaving(true);

    const { error } = await supabase
      .from('equipment')
      .update({
        customer_id: customerId || null,
        make: make || null,
        model: model || null,
        serial_number: serial || null,
        notes: notes || null,
      })
      .eq('id', params.id);

    setSaving(false);

    if (error) setErr(error.message);
    else router.push('/dashboard/equipment');
  }

  async function handleDelete() {
    if (!confirm('Delete this equipment?')) return;
    const { error } = await supabase.from('equipment').delete().eq('id', params.id);
    if (error) alert(error.message);
    else router.push('/dashboard/equipment');
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <h2 className="t-h2">Edit Equipment</h2>

      <form onSubmit={handleSave} className="t-card space-y-4 p-4">
        <div>
          <label className="t-label">Customer</label>
          <select
            className="t-input"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || 'Unnamed'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="t-label">Make *</label>
            <input className="t-input" value={make} onChange={(e) => setMake(e.target.value)} />
          </div>
          <div>
            <label className="t-label">Model</label>
            <input className="t-input" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
          <div>
            <label className="t-label">Serial #</label>
            <input className="t-input" value={serial} onChange={(e) => setSerial(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="t-label">Notes</label>
          <textarea className="t-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <div className="flex gap-2">
          <button type="submit" className="t-btn t-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" className="t-btn" onClick={() => router.push('/dashboard/equipment')}>
            Cancel
          </button>
          <button type="button" className="t-btn t-btn--danger ml-auto" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
