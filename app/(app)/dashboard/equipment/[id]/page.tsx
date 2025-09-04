'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';

type Row = {
  id: string;
  org_id: string;
  customer_id: string | null;
  equipment_code: string | null;
  make: string | null;
  model: string | null;
  serial_number: string | null;
  notes: string | null;
};

export default function EditEquipmentPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [orgId, setOrgId] = useState('');
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [row, setRow] = useState<Row | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form state (mirrors "new" page fields)
  const [equipmentCode, setEquipmentCode] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // active org (for customer dropdown)
      const { data: prof } = await supabase.from('profiles').select('active_org_id').single();
      const oid = (prof?.active_org_id as string) || '';
      setOrgId(oid);

      if (oid) {
        const { data: cs } = await supabase
          .from('customers')
          .select('id,name')
          .eq('org_id', oid)
          .order('name', { ascending: true });
        setCustomers(cs || []);
      }

      // equipment row
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setErr(error.message);
        return;
      }

      setRow(data as Row);

      setEquipmentCode(data?.equipment_code ?? '');
      setMake(data?.make ?? '');
      setModel(data?.model ?? '');
      setSerialNumber(data?.serial_number ?? '');
      setNotes(data?.notes ?? '');
      setCustomerId(data?.customer_id ?? null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!row) return;
    if (!make.trim()) return setErr('Make is required.');

    setSaving(true);
    const { error } = await supabase
      .from('equipment')
      .update({
        equipment_code: equipmentCode || null,
        make,
        model: model || null,
        serial_number: serialNumber || null,
        notes: notes || null,
        customer_id: customerId,
      })
      .eq('id', row.id);

    setSaving(false);

    if (error) return setErr(error.message);
    router.push('/dashboard/equipment');
  }

  async function onDelete() {
    if (!row) return;
    if (!confirm('Delete this equipment? This cannot be undone.')) return;

    setDeleting(true);
    const { error } = await supabase.from('equipment').delete().eq('id', row.id);
    setDeleting(false);

    if (error) return setErr(error.message);
    router.push('/dashboard/equipment');
  }

  const input =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500';
  const label = 'block text-sm font-medium text-gray-800';

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Edit Equipment</h2>

      <form onSubmit={onSave} className="space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5 max-w-3xl">
          {/* Equipment ID */}
          <div>
            <label className={label}>Equipment ID</label>
            <input
              className={input}
              placeholder="e.g. FORK-001"
              value={equipmentCode}
              onChange={(e) => setEquipmentCode(e.target.value)}
            />
          </div>

          {/* Make / Model / Serial */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={label}>
                Make <span className="text-red-500">*</span>
              </label>
              <input
                className={input}
                value={make}
                onChange={(e) => setMake(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={label}>Model</label>
              <input
                className={input}
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Serial #</label>
              <input
                className={input}
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={label}>Notes</label>
            <textarea
              className={`${input} min-h-[96px]`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Customer (last) */}
          <div>
            <label className={label}>Customer</label>
            <select
              className={input}
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
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>

          <a
            href="/dashboard/equipment"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </a>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="ml-auto inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </form>
    </div>
  );
}
