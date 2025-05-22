import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  LayoutDashboard,
  FileText,
  Flag,
  Users,
  Image,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";

import { authOptions } from "@/lib/auth";

// Admin dashboard layout component
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Check if user has admin or editor role
  if (!["ADMIN", "EDITOR"].includes(session.user.role)) {
    // Redirect to unauthorized page or home
    redirect("/");
  }

  const isAdmin = session.user.role === "ADMIN";

  // Define navigation items
  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Blog Posts",
      href: "/admin/posts",
      icon: <FileText size={20} />,
    },
    {
      label: "Services",
      href: "/admin/services",
      icon: <Flag size={20} />,
      adminOnly: true,
    },
    {
      label: "Team Members",
      href: "/admin/team",
      icon: <Users size={20} />,
      adminOnly: true,
    },
    {
      label: "Media Library",
      href: "/admin/media",
      icon: <Image size={20} />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings size={20} />,
      adminOnly: true,
    },
  ];

  // Filter out admin-only items for editors
  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold text-blue-600">
            Medicare Dashboard
          </Link>
          <button className="p-2 rounded-md hover:bg-gray-100">
            <Menu size={24} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
          <div className="p-6">
            <Link href="/admin" className="text-xl font-bold text-blue-600">
              Medicare Dashboard
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
              >
                <span className="mr-3 text-gray-500">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">
                {session.user.name?.[0] || "U"}
              </div>
              <div>
                <div className="font-medium">{session.user.name}</div>
                <div className="text-xs text-gray-500">{session.user.role}</div>
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md w-full"
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
