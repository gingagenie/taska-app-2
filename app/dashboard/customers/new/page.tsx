'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function CustomerNewPage() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const router = useRouter();
  const [orgId, setOrgId] = useState('');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false); const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    supabase.from('profiles').select('active_org_id').single()
      .then(({ data, error }) => { if (error) setErr(error.message); setOrgId(data?.active_org_id ?? ''); });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!orgId) return setErr('No active org.');
    if (!name.trim()) return setErr('Name is required.');
    setLoading(true);
    const { data, error } = await supabase.from('customers').insert({
      org_id: orgId, name: name.trim(), email: email.trim() || null, phone: phone.trim() || null
    }).select('id').single();
    setLoading(false);
    if (error) return setErr(error.message);
    router.push(`/dashboard/customers/${data!.id}`);
  }

  return (
    <main className="grid gap-4 sm:gap-6 max-w-xl">
      <h1 className="text-xl font-semibold sm:text-2xl">Add Customer</h1>
      <form onSubmit={submit} className="grid gap-3">
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
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </button>
          <a href="/dashboard/customers" className="rounded-md border px-4 py-2 hover:bg-gray-50">Cancel</a>
        </div>
      </form>
    </main>
  );
}