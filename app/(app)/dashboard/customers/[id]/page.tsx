'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';

export default function CustomerEditPage() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const router = useRouter(); const p = useParams();
  const id = typeof p?.id === 'string' ? p.id : Array.isArray(p?.id) ? p.id[0] : '';

  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true); const [err, setErr] = useState<string|null>(null);
  const [saving, setSaving] = useState(false); const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setErr(null);
      const { data, error } = await supabase.from('customers').select('id,name,email,phone').eq('id', id).single();
      if (error) setErr(error.message);
      setName(data?.name ?? ''); setEmail(data?.email ?? ''); setPhone(data?.phone ?? '');
      setLoading(false);
    })();
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null);
    const { error } = await supabase.from('customers')
      .update({ name: name.trim(), email: email.trim() || null, phone: phone.trim() || null })
      .eq('id', id);
    setSaving(false);
    if (error) return setErr(error.message);
    router.push('/dashboard/customers');
  }

  async function remove() {
    if (!confirm('Delete this customer?')) return;
    setDeleting(true); setErr(null);
    const { error } = await supabase.from('customers').delete().eq('id', id);
    setDeleting(false);
    if (error) return setErr(error.message);
    router.push('/dashboard/customers');
  }

  if (!id) return <main className="p-4">Missing id</main>;
  if (loading) return <main className="p-4">Loading…</main>;

  return (
    <main className="grid gap-4 sm:gap-6 max-w-xl">
      <h1 className="text-xl font-semibold sm:text-2xl">Edit Customer</h1>
      <form onSubmit={save} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Name</span>
          <input className="rounded-md border px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Email</span>
          <input type="email" className="rounded-md border px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Phone</span>
          <input className="rounded-md border px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} />
        </label>
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
