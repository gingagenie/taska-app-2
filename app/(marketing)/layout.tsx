// app/(marketing)/layout.tsx
import "../globals.css";
import Image from "next/image";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/taska-logo.png" alt="Taska" width={24} height={24} />
            <span className="text-lg font-semibold">Taska</span>
          </Link>
          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#features" className="hover:text-blue-700">Features</a>
            <a href="#workflow" className="hover:text-blue-700">Workflow</a>
            <a href="#pricing" className="hover:text-blue-700">Pricing</a>
            <a href="#faq" className="hover:text-blue-700">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-100">Log in</Link>
            <Link href="/register" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700">
              Start free
            </Link>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
