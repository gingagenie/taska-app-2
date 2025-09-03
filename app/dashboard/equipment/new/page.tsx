'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

type Customer = { id: string; name: string | null };

export default function NewEquipmentPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const [orgId, setOrgId] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [customerId, setCustomerId] = useState<string>('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // get active org
      const { data: prof } = await supabase.from('profiles').select('active_org_id').single();
      const oid = prof?.active_org_id as string;
      setOrgId(oid || '');

      // load customers for dropdown
      if (oid) {
        const { data: rows, error } = await supabase
          .from('customers')
          .select('id,name')
          .eq('org_id', oid)
          .order('name', { ascending: true });
        if (!error) setCustomers((rows || []) as Customer[]);
      }
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!orgId) return setErr('No active org.');
    if (!make.trim()) return setErr('Make is required.');

    setSaving(true);
    const { error } = await supabase.from('equipment').insert({
      org_id: orgId,
      customer_id: customerId || null,
      make: make || null,
      model: model || null,
      serial_number: serial || null,
      notes: notes || null,
    });
    setSaving(false);

    if (error) setErr(error.message);
    else router.push('/dashboard/equipment');
  }

  return (
    <div className="space-y-6">
      <h2 className="t-h2">Add Equipment</h2>

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
        </div>
      </form>
    </div>
  );
}