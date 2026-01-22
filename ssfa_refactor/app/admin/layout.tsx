import AdminSidebar from './components/AdminSidebar';

export const metadata = {
  title: 'SSFA Admin Panel',
  description: 'Sejong Scholarship Foundation in America - Administration',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
