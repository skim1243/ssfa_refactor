import Link from 'next/link'
import { AdminLogoutButton } from '@/app/components/AdminLogoutButton'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-64 min-h-screen flex-col border-r border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Admin Portal</h2>
        <div className="flex flex-1 flex-col gap-2">
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>
          </nav>
          <nav className="space-y-2">
            <Link
              href="/admin/users"
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Users
            </Link>
          </nav>
          <nav className="space-y-2">
            <Link
              href="/admin/applications"
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Applications
            </Link>
          </nav>
          <nav className="space-y-2">
            <Link
              href="/admin/application-cycles"
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Application cycles
            </Link>
          </nav>
          <nav className="space-y-2">
            <Link
              href="/admin/articles"
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Articles
            </Link>
          </nav>
        </div>
        <div className="mt-auto self-stretch border-t border-gray-100 pt-4">
          <AdminLogoutButton />
        </div>
      </aside>

      <section className="flex-1 p-6">{children}</section>
    </div>
  )
}
