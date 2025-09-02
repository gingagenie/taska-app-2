'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

type Row = {
  id: string;
  title: string;
  status: string | null;
  scheduled_for: string | null;
  customer?: { id: string; name: string } | null;
  site?: { id: string; line1: string | null; city: string | null; state: string | null; postcode: string | null } | null;
};

export default function JobsIndexPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [orgId, setOrgId] = useState<string>('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // get active org
    supabase.from('profiles').select('active_org_id').single()
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        setOrgId(data?.active_org_id ?? '');
      });
  }, []);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      setLoading(true); setErr(null);
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id, title, status, scheduled_for,
          customer:customers ( id, name ),
          site:customer_addresses ( id, line1, city, state, postcode )
        `)
        .eq('org_id', orgId)                // explicit filter for index use; RLS still protects
        .order('scheduled_for', { ascending: false })
        .limit(200);
      if (error) setErr(error.message);
      setRows((data as any[]) || []);
      setLoading(false);
    })();
  }, [orgId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      (r.title || '').toLowerCase().includes(q) ||
      (r.customer?.name || '').toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <main style={{ display:'grid', gap:12 }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
        <h1 style={{fontSize:24, fontWeight:700}}>Jobs</h1>
        <Link href="/dashboard/jobs/new">
          <button>+ New Job</button>
        </Link>
      </div>

      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <input
          placeholder="Search jobs or customer…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{flex:1}}
        />
        <span style={{color:'#666'}}>{filtered.length} shown</span>
      </div>

      {err && <p style={{color:'crimson'}}>Error: {err}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
          <p>No jobs yet.</p>
          <p><Link href="/dashboard/jobs/new">Create your first job →</Link></p>
        </div>
      ) : (
        <div style={{display:'grid', gap:8}}>
          {filtered.map((j) => {
            const when = j.scheduled_for ? new Date(j.scheduled_for).toLocaleString() : '—';
            const site = j.site ? [j.site.line1, j.site.city, j.site.state, j.site.postcode].filter(Boolean).join(', ') : '';
            return (
              <Link href={`/dashboard/jobs/${j.id}`} key={j.id} style={{textDecoration:'none', color:'inherit'}}>
                <div style={{
                  border:'1px solid #e5e7eb', borderRadius:12, padding:12,
                  display:'grid', gridTemplateColumns:'minmax(200px,1fr) 160px 220px 220px', gap:12, alignItems:'center'
                }}>
                  <div style={{fontWeight:600}}>{j.title}</div>
                  <div>
                    <span style={{
                      padding:'2px 8px', borderRadius:9999, border:'1px solid #e5e7eb',
                      background:'#f9fafb', fontSize:12
                    }}>
                      {j.status || 'new'}
                    </span>
                  </div>
                  <div style={{color:'#444'}}>{when}</div>
                  <div style={{color:'#666'}}>
                    {(j.customer?.name || '') + (site ? ` • ${site}` : '')}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
