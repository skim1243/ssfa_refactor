'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type AdminNavLink = {
  href: string;
  label: string;
  icon?: string;
};

export default function AdminSidebar() {
  const pathname = usePathname();

  const adminLinks: AdminNavLink[] = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/applications', label: 'Applications', icon: '📝' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/articles', label: 'Articles', icon: '📄' },
    { href: '/admin/announcements', label: 'Announcements', icon: '📢' },
    { href: '/admin/archive', label: 'Archive', icon: '📦' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen border-r border-gray-200">
      {/* Admin Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
          <p className="text-xs text-gray-600">SSFA Management</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-4">
        <ul className="space-y-2">
          {adminLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Back to Public Site */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-gray-50">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>🏠</span>
          <span className="font-medium">Back to Public Site</span>
        </Link>
      </div>
    </aside>
  );
}
