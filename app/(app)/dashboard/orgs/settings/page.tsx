'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

type Org = { id: string; name: string; logo_url: string | null };

export default function OrgSettingsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [org, setOrg] = useState<Org | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setMsg(null); setErr(null);
    // get active org id
    const { data: prof, error: e1 } = await supabase.from('profiles').select('active_org_id').single();
    if (e1 || !prof?.active_org_id) { setErr('No active org. Create/switch one first.'); return; }

    // load org (RLS allows members to read)
    const { data: rows, error: e2 } = await supabase
      .from('orgs')
      .select('id,name,logo_url')
      .eq('id', prof.active_org_id)
      .limit(1);
    if (e2 || !rows?.length) { setErr(e2?.message || 'Org not found'); return; }

    setOrg(rows[0] as Org);
    setName(rows[0].name);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const saveName = async () => {
    if (!org) return;
    setSaving(true); setMsg(null); setErr(null);
    const { error } = await supabase.from('orgs').update({ name }).eq('id', org.id);
    if (error) setErr(error.message);
    else { setMsg('Saved'); await load(); }
    setSaving(false);
  };

  const onLogoChange = async (file: File) => {
    if (!org) return;
    setSaving(true); setMsg(null); setErr(null);

    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${org.id}/logo.${ext}`;

      // upload/overwrite
      const { error: upErr } = await supabase.storage.from('org-logos').upload(path, file, {
        upsert: true,
        contentType: file.type || 'image/png'
      });
      if (upErr) throw upErr;

      // get public URL and save to org
      const { data: pub } = supabase.storage.from('org-logos').getPublicUrl(path);
      const logo_url = pub.publicUrl;
      const { error: upOrgErr } = await supabase.from('orgs').update({ logo_url }).eq('id', org.id);
      if (upOrgErr) throw upOrgErr;

      setMsg('Logo updated');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main>
      <h2>Org Settings</h2>
      {!org && !err && <p>Loading…</p>}
      {err && <p style={{ color: 'crimson' }}>Error: {err}</p>}
      {msg && <p style={{ color: 'green' }}>{msg}</p>}

      {org && (
        <>
          <section style={{ marginBottom: 20 }}>
            <label>
              <div>Organisation name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </label>
            <div style={{ marginTop: 8 }}>
              <button onClick={saveName} disabled={saving || name.trim() === ''}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </section>

          <section style={{ marginBottom: 20 }}>
            <div>Logo</div>
            {org.logo_url ? (
              <div style={{ margin: '8px 0' }}>
                <img src={org.logo_url} alt="Org logo" style={{ height: 64 }} />
              </div>
            ) : (
              <p style={{ color: '#666' }}>No logo yet.</p>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp, image/svg+xml"
              onChange={(e) => e.target.files && onLogoChange(e.target.files[0])}
              disabled={saving}
            />
          </section>

          <p>
            <a href="/dashboard/orgs">← Back to Orgs</a>{' '}
            <a href={`/dashboard/orgs/members?org=${org.id}`}>Manage members</a>
          </p>
        </>
      )}
    </main>
  );
}
