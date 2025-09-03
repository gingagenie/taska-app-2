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

  const [orgId, setOrgId] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<string>('');

  // form fields
  const [equipmentCode, setEquipmentCode] = useState(''); // NEW
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: prof } = await supabase.from('profiles').select('active_org_id').single();
      const oid = (prof?.active_org_id as string) || '';
      setOrgId(oid);

      if (oid) {
        const { data } = await supabase
          .from('customers')
          .select('id,name')
          .eq('org_id', oid)
          .order('name', { ascending: true });
        setCustomers((data || []) as Customer[]);
      }
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!orgId) return setErr('No active org.');
    if (!equipmentCode.trim()) return setErr('Equipment ID is required.');
    if (!make.trim()) return setErr('Make is required.');

    setSaving(true);
    const { error } = await supabase.from('equipment').insert({
      org_id: orgId,
      customer_id: customerId || null,
      equipment_code: equipmentCode || null, // NEW
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
      <div className="flex items-center justify-between">
        <h2 className="t-h2">Add Equipment</h2>
      </div>

      <form onSubmit={handleSave} className="t-card p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="t-label">Equipment ID *</label>
            <input
              className="t-input"
              placeholder="e.g. FORK-001"
              value={equipmentCode}
              onChange={(e) => setEquipmentCode(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your own identifier (sticker/asset tag).
            </p>
          </div>

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <textarea
            className="t-input"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
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