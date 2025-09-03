'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';

type Eq = {
  id: string;
  org_id: string;
  customer_id: string | null;
  equipment_code: string | null;
  make: string;
  model: string | null;
  serial_number: string | null;
  notes: string | null;
};

export default function EditEquipmentPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const params = useParams();
  const router = useRouter();
  const eqId = String((params as any)?.id || '');

  const [orgId, setOrgId] = useState('');
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form state
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [equipmentCode, setEquipmentCode] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // who am I / which org?
        const { data: prof, error: pErr } = await supabase
          .from('profiles')
          .select('active_org_id')
          .single();
        if (pErr) throw pErr;
        const oid = prof?.active_org_id as string;
        setOrgId(oid);

        // load customers for dropdown
        const { data: custs, error: cErr } = await supabase
          .from('customers')
          .select('id,name')
          .eq('org_id', oid)
          .order('name', { ascending: true });
        if (cErr) throw cErr;
        setCustomers(custs || []);

        // load equipment row
        const { data: eq, error: eErr } = await supabase
          .from('equipment')
          .select(
            'id, org_id, customer_id, equipment_code, make, model, serial_number, notes'
          )
          .eq('id', eqId)
          .single();
        if (eErr) throw eErr;

        // hydrate
        setCustomerId(eq?.customer_id ?? null);
        setEquipmentCode(eq?.equipment_code ?? '');
        setMake(eq?.make ?? '');
        setModel(eq?.model ?? '');
        setSerialNumber(eq?.serial_number ?? '');
        setNotes(eq?.notes ?? '');
      } catch (e: any) {
        setErr(e.message || 'Failed to load equipment.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eqId]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!orgId) return setErr('No active org.');
    if (!make.trim()) return setErr('Make is required.');

    setSaving(true);
    const { error } = await supabase
      .from('equipment')
      .update({
        customer_id: customerId,
        equipment_code: equipmentCode || null,
        make,
        model: model || null,
        serial_number: serialNumber || null,
        notes: notes || null,
      })
      .eq('id', eqId)
      .eq('org_id', orgId);

    setSaving(false);
    if (error) return setErr(error.message);
    router.push('/dashboard/equipment');
  }

  async function onDelete() {
    if (!confirm('Delete this equipment? This cannot be undone.')) return;
    setSaving(true);
    const { error } = await supabase.from('equipment').delete().eq('id', eqId);
    setSaving(false);
    if (error) return setErr(error.message);
    router.push('/dashboard/equipment');
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading equipment…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="t-h2">Edit Equipment</h2>
        <button
          onClick={onDelete}
          className="t-btn t-btn--danger"
          disabled={saving}
        >
          Delete
        </button>
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
                required
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