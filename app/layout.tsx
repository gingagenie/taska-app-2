import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Taska Minimal Starter',
  description: 'Get the backbone working, then add the fancy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <div className="max-w-5xl mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}
