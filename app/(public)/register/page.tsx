"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function RegisterPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // If already logged in, go to dashboard
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) window.location.replace("/dashboard");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!fullName.trim() || !orgName.trim() || !email.trim() || !password.trim()) {
      setErr("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;

      // Ensure org exists and is active
      await fetch("/api/ensure-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      });

      window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full name</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Organization / Business name</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Acme Services"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-medium"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
          <Link href="/login" className="rounded-lg border border-white/10 px-4 py-2 text-sm">
            Log in
          </Link>
        </div>
      </form>

      <p className="mt-4 text-sm text-white/60">
        Already have an account?{" "}
        <Link className="text-blue-400 hover:underline" href="/login">
          Log in
        </Link>
      </p>
    </main>
  );
}
