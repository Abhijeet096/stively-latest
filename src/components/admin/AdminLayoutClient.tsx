"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/editor/new", label: "New Article", icon: "✍️" },
  { href: "/admin/articles", label: "All Articles", icon: "📚" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "📧" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
];

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stively Admin
            </Link>
            <div className="flex gap-4 items-center">
              <Link href="/" target="_blank">
                <Button variant="outline" size="sm">
                  👁️ View Site
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border p-4 sticky top-24">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition",
                          isActive
                            ? "bg-purple-50 text-purple-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}