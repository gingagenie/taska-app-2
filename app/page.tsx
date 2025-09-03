// app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/taska-logo.png" alt="Taska" width={28} height={28} />
            <span className="text-lg font-semibold">Taska</span>
          </Link>

          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#features" className="hover:text-blue-700">Features</a>
            <a href="#workflow" className="hover:text-blue-700">Workflow</a>
            <a href="#pricing" className="hover:text-blue-700">Pricing</a>
            <a href="#faq" className="hover:text-blue-700">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-white to-blue-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Field service management that doesn’t fight you
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Taska helps small teams schedule jobs, dispatch techs, capture notes,
              and invoice—fast. Multi-tenant, mobile-friendly, and ready for Stripe & Xero.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                Log in
              </Link>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              No credit card required. Upgrade anytime.
            </p>
          </div>

          {/* Screenshot / Placeholder */}
          <div className="rounded-2xl border bg-white p-3 shadow-sm">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border bg-gray-50">
              {/* Replace the placeholder with a real screenshot later */}
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Dashboard screenshot placeholder
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-gray-500">
              Actual UI from your app goes here (we’ll drop a real screenshot later)
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-semibold">Everything you need to run jobs</h2>
          <p className="mt-2 text-gray-600">
            Built for tradies and service teams. Secure, fast, and simple.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { title: "Multi-tenant orgs", desc: "Separate companies, users, and data with RLS." },
              { title: "Jobs & scheduling", desc: "Calendar, priorities, status, assignments." },
              { title: "Quotes & invoices", desc: "Generate PDFs, send via email, track status." },
              { title: "Stripe billing", desc: "Subscriptions & customer billing built-in." },
              { title: "Xero integration", desc: "Sync invoices & customers to Xero." },
              { title: "SMS & email", desc: "Confirmations, reminders, and notifications." },
              { title: "Maps & navigation", desc: "One-tap directions for mobile techs." },
              { title: "Equipment tracking", desc: "Assets per customer, models, serials, notes." },
              { title: "Permissions", desc: "Admins, dispatchers, techs—right access for each." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border p-4">
                <div className="text-base font-medium">{f.title}</div>
                <div className="mt-1 text-sm text-gray-600">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-semibold">Your workflow, simplified</h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { n: 1, t: "Create customer & equipment" },
              { n: 2, t: "Schedule job & assign tech" },
              { n: 3, t: "Tech completes & uploads notes" },
              { n: 4, t: "Invoice & get paid via Stripe/Xero" },
            ].map((s) => (
              <li key={s.n} className="rounded-xl border p-4">
                <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {s.n}
                </div>
                <div className="text-sm font-medium">{s.t}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b bg-blue-50/40">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-semibold">Simple pricing, no surprises</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { name: "Solo", price: "$29", perks: ["1 user", "Jobs & scheduling", "Invoices & quotes"] },
              { name: "Pro", price: "$49", perks: ["Up to 5 users", "SMS & email", "Equipment tracking"] },
              { name: "Enterprise", price: "$99", perks: ["Unlimited users", "Priority support", "SAML/SSO (optional)"] },
            ].map((p) => (
              <div key={p.name} className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold">{p.name}</div>
                <div className="mt-1 text-3xl font-bold">{p.price}</div>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-6 inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Start free
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-600">Prices in AUD. Upgrade/downgrade any time.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                q: "Can I use email & password?",
                a: "Yes. We support classic login and optional magic links."
              },
              {
                q: "Does Taska integrate with Xero?",
                a: "Yes. Sync invoices and customers (toggle per org)."
              },
              {
                q: "How do subscriptions work?",
                a: "Stripe powers Solo/Pro/Enterprise. Upgrade any time from Billing."
              },
              {
                q: "Is my data isolated per company?",
                a: "Yes. Each org is isolated by Row Level Security in the database."
              },
            ].map((x) => (
              <div key={x.q} className="rounded-xl border p-4">
                <div className="font-medium">{x.q}</div>
                <div className="mt-1 text-sm text-gray-600">{x.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-gray-600 md:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/taska-logo.png" alt="Taska" width={20} height={20} />
            <span>© {new Date().getFullYear()} Taska</span>
          </div>
          <div className="flex gap-4">
            <a href="/login" className="hover:text-blue-700">Login</a>
            <a href="/register" className="hover:text-blue-700">Register</a>
            <a href="mailto:support@taska.info" className="hover:text-blue-700">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}