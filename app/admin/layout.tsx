import Link from 'next/link'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-full bg-gray-50">
      <aside className="w-64 border-r border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Admin Portal</h2>
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
            href="/admin"
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
            href="/admin"
            className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Articles
          </Link>
        </nav>
      </aside>

      <section className="flex-1 p-6">{children}</section>
    </div>
  )
}
