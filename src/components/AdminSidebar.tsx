'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PenTool, 
  FileText, 
  Mail, 
  BarChart3,
  Users,
  CheckSquare
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'New Article',
      href: '/admin/editor/new',
      icon: PenTool,
    },
    {
      name: 'All Articles',
      href: '/admin/articles',
      icon: FileText,
    },
    {
      name: 'Manage Authors',
      href: '/admin/authors',
      icon: Users,
      badge: 'New',
    },
    {
      name: 'Review Submissions',
      href: '/admin/submissions',
      icon: CheckSquare,
      badge: 'New',
    },
    {
      name: 'Newsletter',
      href: '/admin/newsletter',
      icon: Mail,
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-100 text-purple-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}