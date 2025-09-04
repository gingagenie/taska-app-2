// app/(app)/layout.tsx
import Link from "next/link";
import Image from "next/image";
import "../globals.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white">
      <div className="mx-auto max-w-[1400px] grid grid-cols-[240px_1fr] gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="rounded-2xl bg-[#0f1115] border border-white/10 p-4">
          <div className="flex items-center gap-2 px-2 pb-4">
            <Image src="/taska-logo.png" alt="Taska" width={24} height={24} />
            <span className="font-semibold">Taska</span>
          </div>

          <nav className="space-y-1 px-2">
            <Link className="block rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard">Dashboard</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/jobs">Jobs</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/customers">Customers</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/equipment">Equipment</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/orgs">Orgs</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/billing">Billing</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/schedule">Schedule</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-white/5" href="/dashboard/settings">Settings</Link>
          </nav>

          <div className="mt-6 text-xs text-white/50 px-2">
            PRO features: Quotes • Invoices • Schedule
          </div>
        </aside>

        {/* Main */}
        <main className="rounded-2xl bg-[#0f1115] border border-white/10 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
