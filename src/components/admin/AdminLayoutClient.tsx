'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PenTool,
  FileText,
  Mail,
  BarChart3,
  Users,
  CheckSquare,
  Upload,
} from 'lucide-react';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    if ((session.user as any).role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session?.user || (session.user as any).role !== 'admin') {
    return null;
  }

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
      name: 'Import Document',
      href: '/admin/import',
      icon: Upload,
    },
    {
      name: 'Manage Authors',
      href: '/admin/authors',
      icon: Users,
    },
    {
      name: 'Review Submissions',
      href: '/admin/submissions',
      icon: CheckSquare,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Stively Admin
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-1"
            >
              🌍 View Site
            </Link>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] sticky top-[73px] self-start">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname?.startsWith(item.href));

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
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-73px)]">{children}</main>
      </div>
    </div>
  );
}