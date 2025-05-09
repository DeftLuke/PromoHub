import type { Metadata } from 'next';
import AdminNav from './components/admin-nav';

export const metadata: Metadata = {
  title: 'Sohoz88 Admin Dashboard',
  description: 'Manage Sohoz88 promotions and site settings.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav />
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
