// app/(app)/layout.tsx
import Image from "next/image";
import Link from "next/link";
import "../globals.css"; // make sure globals are available

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="t-shell min-h-screen">
      {/* Sidebar */}
      <aside className="t-card t-sidebar">
        <div className="t-sidebar__brand">
          <Image src="/taska-logo.png" alt="Taska" width={24} height={24} />
          <span className="t-brand">Taska</span>
        </div>

        <nav className="t-nav">
          <Link className="t-nav__item" href="/dashboard">Dashboard</Link>
          <Link className="t-nav__item" href="/dashboard/jobs">Jobs</Link>
          <Link className="t-nav__item" href="/dashboard/customers">Customers</Link>
          <Link className="t-nav__item" href="/dashboard/equipment">Equipment</Link>
          <Link className="t-nav__item" href="/dashboard/orgs">Orgs</Link>
          <Link className="t-nav__item" href="/dashboard/billing">Billing</Link>
          <Link className="t-nav__item" href="/dashboard/settings">Settings</Link>
        </nav>

        <div className="t-sidebar__note">PRO features: Quotes • Invoices • Schedule</div>
      </aside>

      {/* Main */}
      <main className="t-main">
        {children}
      </main>
    </div>
  );
}
