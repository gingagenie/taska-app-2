// app/layout.tsx
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Taska", description: "Field Service Management" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <div className="grid grid-cols-[240px_1fr] gap-6">
            {/* Sidebar */}
            <aside className="card p-4">
              <div className="flex items-center gap-2 px-2 pb-4">
                <Image src="/logo.svg" alt="Taska" width={24} height={24} />
                <span className="font-semibold">Taska</span>
              </div>

              <nav className="space-y-1">
                <Link className="block rounded-lg px-3 py-2 hover:bg-muted" href="/dashboard">Dashboard</Link>
                <Link className="block rounded-lg px-3 py-2 hover:bg-muted" href="/dashboard/jobs">Jobs</Link>
                <Link className="block rounded-lg px-3 py-2 hover:bg-muted" href="/dashboard/orgs">Orgs</Link>
                <Link className="block rounded-lg px-3 py-2 hover:bg-muted" href="/dashboard/billing">Billing</Link>
                <Link className="block rounded-lg px-3 py-2 hover:bg-muted" href="/dashboard/settings">Settings</Link>
              </nav>

              <div className="mt-6 rounded-xl bg-sidebar-accent/70 px-3 py-2 text-xs text-muted-foreground">
                PRO features: Quotes • Invoices • Schedule
              </div>
            </aside>

            {/* Main */}
            <main className="space-y-6">
              <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <Link href="/dashboard/jobs/new" className="btn-primary">+ New Job</Link>
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                <section className="card p-4">
                  <h2 className="mb-3 text-lg font-semibold">Jobs Today</h2>
                  {/* Slot in your jobs list here (current dashboard content) */}
                  {children}
                </section>

                <section className="card p-4">
                  <h2 className="mb-3 text-lg font-semibold">Upcoming Jobs</h2>
                  <p className="text-muted-foreground">Coming soon.</p>
                </section>
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
