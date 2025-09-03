'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function NewEquipmentPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const [orgId, setOrgId] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const [equipmentCode, setEquipmentCode] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('active_org_id')
        .single();
      const oid = profile?.active_org_id as string;
      setOrgId(oid);

      const { data: custs } = await supabase
        .from('customers')
        .select('id,name')
        .eq('org_id', oid)
        .order('name', { ascending: true });

      setCustomers(custs || []);
    })();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return setErr('No active org.');
    if (!make.trim()) return setErr('Make is required.');

    setSaving(true);
    const { error } = await supabase.from('equipment').insert({
      org_id: orgId,
      customer_id: customerId,
      equipment_code: equipmentCode || null,
      make,
      model: model || null,
      serial_number: serialNumber || null,
      notes: notes || null,
    });

    setSaving(false);
    if (error) return setErr(error.message);
    router.push('/dashboard/equipment');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="t-h2">Add Equipment</h2>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <div className="t-card p-5 space-y-4">
          <div>
            <label className="t-label">Customer</label>
            <select
              className="t-select"
              value={customerId || ''}
              onChange={(e) => setCustomerId(e.target.value || null)}
            >
              <option value="">Unassigned</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="t-grid-3">
            <div>
              <label className="t-label">Equipment ID</label>
              <input
                className="t-input"
                placeholder="e.g. FORK-001"
                value={equipmentCode}
                onChange={(e) => setEquipmentCode(e.target.value)}
              />
            </div>
            <div>
              <label className="t-label">Make *</label>
              <input
                className="t-input"
                value={make}
                onChange={(e) => setMake(e.target.value)}
              />
            </div>
            <div>
              <label className="t-label">Model</label>
              <input
                className="t-input"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="t-label">Serial #</label>
            <input
              className="t-input"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="t-label">Notes</label>
            <textarea
              className="t-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            className="t-btn t-btn--primary"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <a href="/dashboard/equipment" className="t-btn">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}